/* Herramienta enchufable: «La cuenta de hoy» (palabra CALCULO).
   Todo se calcula en el teléfono. No envía nada a ningún lado.
   Contrato con el cascarón (assets/cascaron.js):
     id, version, textos[lang], vacio(), ejemplo(),
     pintarFormulario(cont, entradas, t, avisar), calcular(entradas),
     pintarResultado(cont, res, t, anio), resumenHoja(res, t),
     aHash(entradas) y deHash(hash) para llevar los números en el # al abrir en el navegador. */
(function (raiz) {
  "use strict";
  var RC = raiz.RC = raiz.RC || {};
  RC.herramientas = RC.herramientas || {};

  var MIEL = "#e7b35c", AZUL = "#4da3ff", CIAN = "#22d3ee";

  /* ---------- Números ---------- */
  function num(v) {
    if (v === null || v === undefined) return NaN;
    var s = String(v).replace(/[^0-9.]/g, "");
    if (s === "" || s === ".") return NaN;
    return parseFloat(s);
  }
  function lista(xs, y) {
    return xs.length < 2 ? String(xs[0]) : xs.slice(0, -1).join(", ") + " " + y + " " + xs[xs.length - 1];
  }
  function usd(n) {
    return "$" + Math.round(Math.max(0, n)).toLocaleString("en-US");
  }

  /* Saldo de la casa al final del año t (cuota fija mensual, como el video). */
  function saldoCasa(D, N, tasa, t) {
    if (!(D > 0) || !(N > 0)) return 0;
    if (t >= N) return 0;
    if (t <= 0) return D;
    if (tasa > 0) {
      var r = tasa / 100 / 12, n = 12 * N, m = 12 * t;
      var a = Math.pow(1 + r, n), b = Math.pow(1 + r, m);
      return D * (a - b) / (a - 1);
    }
    return D * (1 - t / N);
  }

  /* Cálculo completo. Devuelve {falta: clave} si falta algo para dibujar.
     res.avisos: cosas que no frenan la cuenta pero que la persona debe ver (tasa rara, ceros de más, hijos mayores). */
  function calcular(e) {
    var D = num(e.deuda), N = num(e.anios), tasaCruda = num(e.tasa), tasa = tasaCruda;
    var G = num(e.gasto), O = num(e.otras), P = num(e.tiene), AG = num(e.aniosGasto);
    var E = [18, 21, 22].indexOf(+e.tope) >= 0 ? +e.tope : 18;
    var k = Math.max(0, Math.min(6, +e.hijos || 0));
    D = D > 0 ? D : 0; G = G > 0 ? G : 0; O = O > 0 ? O : 0; P = P > 0 ? P : 0;
    var avisos = [];
    tasa = tasa > 0 && tasa < 30 ? tasa : 0;
    if (tasaCruda >= 30) avisos.push("tasaAlta");
    if (D > 5000000 || G > 50000 || O > 5000000) avisos.push("ceros");

    if (D === 0 && G === 0 && O === 0) return { falta: "vacio" };
    if (D > 0 && !(N >= 1 && N <= 40)) return { falta: "anios" };
    if (D === 0) N = 0;

    var hijos = [];
    for (var i = 0; i < k; i++) {
      var crudo = (e.edades || [])[i];
      var ed = num(crudo);
      if (isNaN(ed)) return { falta: "edades" };
      if (!(ed >= 0 && ed <= 40)) return { falta: "edadRango" };
      ed = Math.floor(ed);
      hijos.push({ n: i + 1, edad: ed, anios: Math.max(0, E - ed) });
    }
    var A = 0, sinHijos = false;
    hijos.forEach(function (h) { if (h.anios > A) A = h.anios; });
    if (G > 0 && k === 0) {
      // Pareja u otra familia sin hijos que depende de ese ingreso: la persona dice por cuántos años.
      if (!(AG >= 1 && AG <= 40)) return { falta: "aniosGasto" };
      A = Math.floor(AG); sinHijos = true;
    }
    if (G > 0 && k > 0 && A === 0) avisos.push("pasaronTope");

    var T = Math.max(N, A, 1);
    var serie = [];
    for (var t = 0; t <= T; t++) {
      var casa = saldoCasa(D, N, tasa, t);
      var fam = G * 12 * Math.max(0, A - t);
      serie.push({ t: t, casa: casa, familia: fam, total: Math.max(0, casa + fam + O - P) });
    }
    function totalEn(t) { return t > T ? serie[T].total : serie[Math.max(0, t)].total; }

    // Los tres momentos, siempre en orden de años y sin repetir el mismo año.
    var hitos = [{ t: 0, clave: "hoy" }, { t: 10, clave: "en10" }];
    if (k > 0 && A > 0) hitos.push({ t: A, clave: "menor" });
    else if (sinHijos && A > 0) hitos.push({ t: A, clave: "finGasto" });
    else if (T > 10) hitos.push({ t: Math.min(20, T), clave: "anioN" });
    hitos.sort(function (a, b) { return a.t - b.t; });
    hitos = hitos.filter(function (h, i) {
      var sig = hitos[i + 1];
      return !(sig && sig.t === h.t); // si dos caen el mismo año, queda el más específico (el de después)
    });
    hitos.forEach(function (h) { h.valor = totalEn(h.t); });

    return {
      D: D, N: N, tasa: tasa, G: G, O: O, P: P, E: E, k: k, hijos: hijos, A: A, T: T, sinHijos: sinHijos,
      serie: serie, hitos: hitos, avisos: avisos,
      hoy: totalEn(0), en10: totalEn(10),
      familiaHoy: G * 12 * A,
      ejemplo: !!e.ejemplo
    };
  }

  /* ---------- La casa de bloques ---------- */
  /* Bloques en unidades: cuerpo 8x5 y techo 7,5,3,1. Se pintan de abajo hacia arriba:
     lo azul (ya es tuyo) crece desde la base. */
  var BLOQUES = (function () {
    var b = [];
    for (var f = 0; f < 5; f++) for (var c = 0; c < 8; c++) b.push({ x: c, y: 8 - f, w: 1, h: 1 });
    var techo = [7, 5, 3, 1];
    techo.forEach(function (cant, i) {
      var ini = (8 - cant) / 2;
      for (var c = 0; c < cant; c++) b.push({ x: ini + c, y: 3 - i, w: 1, h: 1 });
    });
    return b; // ya ordenados de abajo hacia arriba
  })();
  function cuantosAzules(fraccionDebe) {
    var tot = BLOQUES.length;
    var az = Math.round(tot * (1 - fraccionDebe));
    if (fraccionDebe > 0 && az >= tot) az = tot - 1;
    if (fraccionDebe <= 0) az = tot;
    return Math.max(0, az);
  }
  function casaSVG(fraccionDebe, titulo) {
    var az = cuantosAzules(fraccionDebe), s = 30, g = 3;
    var h = '<svg viewBox="-3 -3 ' + (8 * s + 6) + " " + (9 * s + 6) + '" role="img" aria-label="' + titulo + '">';
    BLOQUES.forEach(function (bl, i) {
      h += '<rect x="' + (bl.x * s + g / 2) + '" y="' + (bl.y * s + g / 2) + '" width="' + (s - g) + '" height="' + (s - g) +
        '" rx="4" fill="' + (i < az ? AZUL : MIEL) + '"/>';
    });
    return h + "</svg>";
  }
  function casaCanvas(ctx, x, y, ancho, fraccionDebe) {
    var az = cuantosAzules(fraccionDebe), s = ancho / 8, g = s * 0.1;
    BLOQUES.forEach(function (bl, i) {
      ctx.fillStyle = i < az ? AZUL : MIEL;
      ctx.fillRect(x + bl.x * s + g / 2, y + (bl.y - 0) * s + g / 2, s - g, s - g);
    });
  }

  /* ---------- Textos ---------- */
  var TX = {
    es: {
      titulo: "Tu cuenta de hoy",
      bajada: "Pon tus números. Ves cómo baja lo que tu familia tendría que cubrir si faltas, año por año hasta cero.",
      deuda: "Lo que debes hoy de tu casa", deudaAyuda: "Si no tienes casa o ya la pagaste, déjalo en blanco.",
      anios: "Años que te quedan", aniosFin: "años",
      tasa: "Tu tasa fija (opcional)", tasaAyuda: "La de tu estado de cuenta. Si no la sabes, déjala en blanco.",
      hijos: "¿Cuántos hijos dependen de ti?",
      edad: "Edad del hijo", tope: "¿Hasta qué edad los cuentas?", topeAyuda: "En Florida se es adulto a los 18.",
      gasto: "Gasto del mes de tu familia", gastoAyuda: "Lo que depende de tu ingreso, sin la cuota de la casa (esa ya está arriba): comida, luz, escuela, carro. Si no tienes casa, la renta sí va.",
      aniosGasto: "Sin hijos: ¿por cuántos años dependería tu familia de ese gasto?", aniosGastoAyuda: "Por ejemplo, tu pareja. Pon los años.",
      mas: "Más números (opcional)",
      otras: "Otras deudas", otrasAyuda: "Carro, tarjetas. Se cuentan como están hoy.",
      tiene: "Protección que ya tienes", tieneAyuda: "También la del trabajo.",
      falta: {
        vacio: "Pon lo que debes de tu casa, el gasto del mes u otras deudas, y aquí se dibuja tu cuenta.",
        anios: "Pon los años que te quedan de la casa (de 1 a 40).",
        edades: "Pon la edad de cada hijo.",
        edadRango: "La edad de cada hijo va de 0 a 40. Revisa el número.",
        aniosGasto: "No pusiste hijos. Para contar el gasto del mes, dinos por cuántos años dependería tu familia de ese gasto (de 1 a 40)."
      },
      avisos: {
        tasaAlta: "Esa tasa parece alta; revísala (por ejemplo, 6.5). Mientras tanto la casa se dibuja sin tasa.",
        ceros: "¿Seguro? Revisa los ceros. Escribe la cantidad sin centavos.",
        pasaronTope: "Tus hijos ya pasaron la edad que elegiste; el gasto del mes no se cuenta. Si aún dependen de ti, sube la edad tope."
      },
      frase: "Esto es lo que tu familia tendría que cubrir si faltas, con tus números de hoy.",
      marca10: "10 años", marcaMenor: function (E) { return "Tu menor: " + E; },
      hoy: "Hoy", en10: "En 10 años", menor: function (E) { return "Cuando tu menor cumpla " + E; },
      finGasto: function (A) { return "En " + A + (A === 1 ? " año" : " años"); }, anioN: function (n) { return "En " + n + " años"; },
      anio: "Año", debes: "debes", casaTit: "Tu casa", casaLey: ["Lo que debes", "Ya es tuyo"],
      casaRot: function (t, v) { return "Año " + t + ": debes " + v; },
      sinTasa: "Sin tu tasa, la casa se dibuja en línea recta. Con tu tasa baja más lento al principio.",
      hijosTit: "Tus hijos, en años", hijoRot: function (h, quedan) { return ["Hijo " + h.n + " · " + h.edad + (h.edad === 1 ? " año" : " años"), "le quedan " + quedan]; },
      totalTit: "Lo que tu familia tendría que cubrir",
      grafAria: "Gráfica del total, que baja año por año",
      aprendiste: "Lo que tu familia tendría que cubrir si faltas baja cada año.",
      sinCasa: "No pusiste casa.",
      filas: {
        casa: "Lo que debes de tu casa", anios: function (N, tasa) { return N + " años" + (tasa ? " al " + tasa + " % fijo" : " (sin tasa, en línea recta)"); },
        hijos: function (hs, E) { return (hs.length > 1 ? "Hijos de " : "Hijo de ") + lista(hs.map(function (h) { return h.edad; }), "y") + " años: les faltan " + lista(hs.map(function (h) { return h.anios; }), "y") + " años para los " + E; },
        hijosPasaron: function (hs, E) { return (hs.length > 1 ? "Hijos de " : "Hijo de ") + lista(hs.map(function (h) { return h.edad; }), "y") + " años: ya pasaron los " + E; },
        gasto: function (G, A) { return "Gasto del mes sin la cuota de la casa " + usd(G) + " × 12 × " + A + " años"; },
        gastoNo: "Gasto del mes: no se cuenta (tus hijos ya pasaron la edad que elegiste)",
        otras: "Otras deudas (como están hoy)", tiene: "Protección que ya tienes (se resta)"
      }
    },
    en: {
      titulo: "Today's number",
      bajada: "Enter your numbers. Watch what your family would have to cover if you were gone go down, year by year, to zero.",
      deuda: "What you owe on your home today", deudaAyuda: "If you don't own a home or it's paid off, leave it blank.",
      anios: "Years left", aniosFin: "years",
      tasa: "Your fixed rate (optional)", tasaAyuda: "From your statement. If you don't know it, leave it blank.",
      hijos: "How many children depend on you?",
      edad: "Child's age", tope: "Up to what age do you count them?", topeAyuda: "In Florida you are an adult at 18.",
      gasto: "Your family's monthly spending", gastoAyuda: "What depends on your income, without your mortgage payment (that's already above): food, power, school, car. If you don't own a home, rent does go here.",
      aniosGasto: "No children: for how many years would your family depend on that spending?", aniosGastoAyuda: "For example, your partner. Enter the years.",
      mas: "More numbers (optional)",
      otras: "Other debts", otrasAyuda: "Car, cards. Counted as they are today.",
      tiene: "Protection you already have", tieneAyuda: "Including through work.",
      falta: {
        vacio: "Enter what you owe on your home, your monthly spending or other debts, and your number shows up here.",
        anios: "Enter the years left on your home (1 to 40).",
        edades: "Enter each child's age.",
        edadRango: "Each child's age goes from 0 to 40. Check the number.",
        aniosGasto: "You didn't enter children. To count monthly spending, tell us for how many years your family would depend on it (1 to 40)."
      },
      avisos: {
        tasaAlta: "That rate looks high; check it (for example, 6.5). Meanwhile the home is drawn without a rate.",
        ceros: "Sure? Check the zeros. Enter the amount without cents.",
        pasaronTope: "Your children are past the age you chose; monthly spending isn't counted. If they still depend on you, raise the age."
      },
      frase: "This is what your family would have to cover if you were gone, with today's numbers.",
      marca10: "10 yrs", marcaMenor: function (E) { return "Youngest: " + E; },
      hoy: "Today", en10: "In 10 years", menor: function (E) { return "When your youngest turns " + E; },
      finGasto: function (A) { return "In " + A + (A === 1 ? " year" : " years"); }, anioN: function (n) { return "In " + n + " years"; },
      anio: "Year", debes: "you owe", casaTit: "Your home", casaLey: ["What you owe", "Already yours"],
      casaRot: function (t, v) { return "Year " + t + ": you owe " + v; },
      sinTasa: "Without your rate, the home is drawn as a straight line. With your rate it goes down slower at first.",
      hijosTit: "Your children, in years", hijoRot: function (h, quedan) { return ["Child " + h.n + " · age " + h.edad, quedan + " years left"]; },
      totalTit: "What your family would have to cover",
      grafAria: "Chart of the total going down year by year",
      aprendiste: "What your family would have to cover if you were gone goes down every year.",
      sinCasa: "No home entered.",
      filas: {
        casa: "What you owe on your home", anios: function (N, tasa) { return N + " years" + (tasa ? " at " + tasa + "% fixed" : " (no rate, straight line)"); },
        hijos: function (hs, E) { return (hs.length > 1 ? "Children ages " : "Child age ") + lista(hs.map(function (h) { return h.edad; }), "and") + ": " + lista(hs.map(function (h) { return h.anios; }), "and") + " years until " + E; },
        hijosPasaron: function (hs, E) { return (hs.length > 1 ? "Children ages " : "Child age ") + lista(hs.map(function (h) { return h.edad; }), "and") + ": already past " + E; },
        gasto: function (G, A) { return "Monthly spending without the mortgage payment " + usd(G) + " × 12 × " + A + " years"; },
        gastoNo: "Monthly spending: not counted (your children are past the age you chose)",
        otras: "Other debts (as they are today)", tiene: "Protection you already have (subtracted)"
      }
    }
  };

  /* ---------- Formulario ---------- */
  function campoNum(id, et, ayuda, valor, opc) {
    opc = opc || {};
    return '<div class="campo"><label for="' + id + '">' + et + (ayuda ? '<span class="ayuda">' + ayuda + "</span>" : "") + "</label>" +
      '<div class="entrada-num' + (opc.signo ? " con-signo" : "") + (opc.fin ? " con-fin" : "") + '">' +
      (opc.signo ? '<span class="signo">' + opc.signo + "</span>" : "") +
      '<input id="' + id + '" data-campo="' + (opc.campo || id) + '" inputmode="' + (opc.decimal ? "decimal" : "numeric") +
      '" autocomplete="off" enterkeyhint="next" value="' + (valor == null ? "" : String(valor).replace(/"/g, "")) + '">' +
      (opc.fin ? '<span class="fin">' + opc.fin + "</span>" : "") + "</div></div>";
  }
  function miles(v) {
    var n = num(v);
    return isNaN(n) ? "" : Math.round(n).toLocaleString("en-US");
  }

  function pintarFormulario(cont, e, lang, avisar) {
    var t = TX[lang];
    function edadesHTML() {
      var h = "";
      for (var i = 0; i < e.hijos; i++) {
        h += campoNum("edad-" + i, t.edad + " " + (i + 1), "", (e.edades || [])[i], { campo: "edad", fin: "" });
      }
      return h;
    }
    var botonesHijos = "", botonesTope = "";
    for (var i = 0; i <= 6; i++) botonesHijos += '<button type="button" data-hijos="' + i + '" aria-pressed="' + (e.hijos === i) + '">' + i + "</button>";
    [18, 21, 22].forEach(function (v) { botonesTope += '<button type="button" data-tope="' + v + '" aria-pressed="' + (+e.tope === v) + '">' + v + "</button>"; });

    cont.innerHTML =
      campoNum("deuda", t.deuda, t.deudaAyuda, miles(e.deuda), { signo: "$" }) +
      '<div class="dos-col" style="margin-top:16px">' +
      campoNum("anios", t.anios, "", e.anios, { fin: t.aniosFin }) +
      campoNum("tasa", t.tasa, "", e.tasa, { fin: "%", decimal: true }) +
      "</div><p class=\"chico\" style=\"margin:6px 0 0\">" + t.tasaAyuda + "</p>" +
      '<div class="campo"><span class="etiqueta" id="et-hijos">' + t.hijos + '</span><div class="botones-opcion" role="group" aria-labelledby="et-hijos">' + botonesHijos + "</div></div>" +
      '<div class="edades" id="edades">' + edadesHTML() + "</div>" +
      '<div class="campo" id="campo-tope"' + (e.hijos ? "" : " hidden") + '><span class="etiqueta" id="et-tope">' + t.tope + '<span class="ayuda">' + t.topeAyuda + '</span></span><div class="botones-opcion" role="group" aria-labelledby="et-tope">' + botonesTope + "</div></div>" +
      campoNum("gasto", t.gasto, t.gastoAyuda, miles(e.gasto), { signo: "$" }) +
      '<div id="caja-anios-gasto"' + (!e.hijos && num(e.gasto) > 0 ? "" : " hidden") + ">" +
      campoNum("anios-gasto", t.aniosGasto, t.aniosGastoAyuda, e.aniosGasto, { campo: "aniosGasto", fin: t.aniosFin }) + "</div>" +
      '<details class="mas"' + (num(e.otras) > 0 || num(e.tiene) > 0 ? " open" : "") + "><summary>" + t.mas + "</summary>" +
      campoNum("otras", t.otras, t.otrasAyuda, miles(e.otras), { signo: "$" }) +
      campoNum("tiene", t.tiene, t.tieneAyuda, miles(e.tiene), { signo: "$" }) +
      "</details>";

    cont.oninput = function (ev) {
      var el = ev.target, c = el.getAttribute("data-campo");
      if (!c) return;
      if (c === "edad") {
        var idx = +el.id.split("-")[1];
        e.edades = e.edades || [];
        e.edades[idx] = el.value.replace(/[^0-9]/g, "").slice(0, 2);
        if (el.value !== e.edades[idx]) el.value = e.edades[idx];
      } else if (c === "tasa") {
        // Un solo punto decimal: «6.5.3» queda en «6.53».
        var tp = el.value.replace(/,/g, ".").replace(/[^0-9.]/g, "").split(".");
        e.tasa = (tp.length > 1 ? tp[0] + "." + tp.slice(1).join("") : tp[0]).slice(0, 5);
        if (el.value !== e.tasa) el.value = e.tasa;
      } else if (c === "anios" || c === "aniosGasto") {
        e[c] = el.value.replace(/[^0-9]/g, "").slice(0, 2);
        if (el.value !== e[c]) el.value = e[c];
      } else {
        // Dinero: los centavos se cortan antes de limpiar («300,000.75» queda en 300,000, no en 30,000,075).
        var crudo = el.value.split(".")[0].replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "").slice(0, 9);
        e[c] = crudo;
        var bonito = crudo ? (+crudo).toLocaleString("en-US") : "";
        if (el.value !== bonito) el.value = bonito;
        if (c === "gasto") cont.querySelector("#caja-anios-gasto").hidden = !!e.hijos || !(+crudo > 0);
      }
      e.ejemplo = false;
      avisar();
    };
    cont.onclick = function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      if (b.hasAttribute("data-hijos")) {
        e.hijos = +b.getAttribute("data-hijos");
        e.edades = (e.edades || []).slice(0, e.hijos);
        cont.querySelectorAll("[data-hijos]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        cont.querySelector("#edades").innerHTML = edadesHTML();
        cont.querySelector("#campo-tope").hidden = !e.hijos;
        cont.querySelector("#caja-anios-gasto").hidden = !!e.hijos || !(num(e.gasto) > 0);
      } else if (b.hasAttribute("data-tope")) {
        e.tope = +b.getAttribute("data-tope");
        cont.querySelectorAll("[data-tope]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      } else return;
      e.ejemplo = false;
      avisar();
    };
  }

  /* ---------- Resultado vivo ---------- */
  function etiquetaHito(h, res, t) {
    if (h.clave === "hoy") return t.hoy;
    if (h.clave === "en10") return t.en10;
    if (h.clave === "menor") return t.menor(res.E);
    if (h.clave === "finGasto") return t.finGasto(h.t);
    return t.anioN(h.t);
  }

  function graficaSVG(res, t, anio) {
    var W = 340, H = 190, iz = 8, de = 8, ar = 14, ab = 26;
    var max = 1;
    res.serie.forEach(function (p) { if (p.total > max) max = p.total; });
    function X(tt) { return iz + (W - iz - de) * (tt / res.T); }
    function Y(v) { return ar + (H - ar - ab) * (1 - v / max); }
    var linea = "", area = "M" + X(0) + "," + Y(0);
    res.serie.forEach(function (p, i) {
      linea += (i ? "L" : "M") + X(p.t).toFixed(1) + "," + Y(p.total).toFixed(1);
      area += "L" + X(p.t).toFixed(1) + "," + Y(p.total).toFixed(1);
    });
    area += "L" + X(res.T) + "," + Y(0) + "Z";
    var marcas = res.hitos.filter(function (m) { return m.t > 0; }).map(function (m) {
      return [m.t, m.clave === "en10" ? t.marca10 : m.clave === "menor" ? t.marcaMenor(res.E) : ""];
    });
    var h = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + t.grafAria + '">' +
      '<line x1="' + iz + '" x2="' + (W - de) + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="rgba(255,255,255,.25)"/>' +
      '<path d="' + area + '" fill="rgba(34,211,238,.14)"/>' +
      '<path d="' + linea + '" fill="none" stroke="' + CIAN + '" stroke-width="3" stroke-linejoin="round"/>';
    marcas.forEach(function (m, i) {
      if (m[0] > res.T || m[0] <= 0) return;
      h += '<line x1="' + X(m[0]) + '" x2="' + X(m[0]) + '" y1="' + ar + '" y2="' + Y(0) + '" stroke="rgba(255,255,255,.18)" stroke-dasharray="3 4"/>';
      if (m[1]) h += '<text x="' + (X(m[0]) + 4) + '" y="' + (ar + 8 + i * 16) + '" fill="#a79f8d" font-size="11">' + m[1] + "</text>";
    });
    var ax = Math.min(anio, res.T);
    var pt = res.serie[ax];
    h += '<line x1="' + X(ax) + '" x2="' + X(ax) + '" y1="' + ar + '" y2="' + Y(0) + '" stroke="' + MIEL + '" stroke-width="2"/>' +
      '<circle cx="' + X(ax) + '" cy="' + Y(pt.total) + '" r="6" fill="' + MIEL + '" stroke="#08080c" stroke-width="2"/>' +
      '<text x="' + iz + '" y="' + (H - 6) + '" fill="#a79f8d" font-size="12">' + t.anio + " 0</text>" +
      '<text x="' + (W - de) + '" y="' + (H - 6) + '" fill="#a79f8d" font-size="12" text-anchor="end">' + t.anio + " " + res.T + "</text>" +
      "</svg>";
    return h;
  }

  function pintarResultado(cont, res, lang, anio) {
    var t = TX[lang];
    if (res.falta) {
      cont.innerHTML = '<div class="aviso-suave">' + t.falta[res.falta] + "</div>";
      return;
    }
    anio = Math.max(0, Math.min(anio || 0, res.T));
    var p = res.serie[anio];
    var h = res.avisos.map(function (a) { return '<div class="aviso-suave" role="status">' + t.avisos[a] + "</div>"; }).join("") +
      '<p class="frase" id="frase-resultado">' + t.frase + "</p>" +
      '<div class="cifras" style="grid-template-columns:repeat(' + res.hitos.length + ',1fr)">' +
      res.hitos.map(function (m) {
        return '<div class="cifra"><span class="r">' + etiquetaHito(m, res, t) + '</span><span class="v">' + usd(m.valor) + "</span></div>";
      }).join("") +
      "</div>" +
      '<div class="deslizador"><div class="linea-anio"><span class="anio">' + t.anio + " " + anio + '</span><span class="debes">' + usd(p.total) + "</span></div>" +
      '<input type="range" id="anio" min="0" max="' + res.T + '" step="1" value="' + anio + '" aria-label="' + t.anio + '">' +
      '<div class="extremos"><span>' + t.anio + " 0</span><span>" + t.anio + " " + res.T + "</span></div></div>" +
      '<div class="vivo"></div>';
    cont.innerHTML = h;
    var vivo = cont.querySelector(".vivo"), rango = cont.querySelector("#anio");
    var etAnio = cont.querySelector(".anio"), etTotal = cont.querySelector(".debes");
    pintarVivo(vivo, res, t, anio);
    rango.oninput = function () {
      var a = +rango.value;
      etAnio.textContent = t.anio + " " + a;
      etTotal.textContent = usd(res.serie[a].total);
      pintarVivo(vivo, res, t, a);
      if (typeof cont.alCambiarAnio === "function") cont.alCambiarAnio(a);
    };
  }

  function pintarVivo(cont, res, t, anio) {
    var h = '<div class="tarjeta"><h3>' + t.totalTit + '</h3><div class="grafica">' + graficaSVG(res, t, anio) + "</div></div>";
    if (res.D > 0) {
      var rot = [10, 20, res.N].filter(function (v, i, a) { return v <= res.N && a.indexOf(v) === i; });
      h += '<div class="tarjeta"><h3>' + t.casaTit + "</h3>" +
        '<div class="casa-vivo">' + casaSVG(saldoCasa(res.D, res.N, res.tasa, anio) / res.D, t.casaTit) + "</div>" +
        '<p class="leyenda"><span><i style="background:' + MIEL + '"></i>' + t.casaLey[0] + '</span><span><i style="background:' + AZUL + '"></i>' + t.casaLey[1] + "</span></p>" +
        '<ul class="rotulos-casa"><li><b>' + t.casaRot(anio, usd(saldoCasa(res.D, res.N, res.tasa, anio))) + "</b></li>" +
        rot.map(function (a) { return "<li>" + t.casaRot(a, usd(saldoCasa(res.D, res.N, res.tasa, a))) + "</li>"; }).join("") + "</ul>" +
        (res.tasa ? "" : '<p class="chico">' + t.sinTasa + "</p>") + "</div>";
    }
    if (res.k > 0) {
      var maxA = Math.max(1, res.A);
      h += '<div class="tarjeta"><h3>' + t.hijosTit + '</h3><div class="hijos">' +
        res.hijos.map(function (hj) {
          var quedan = Math.max(0, hj.anios - anio), r = t.hijoRot(hj, quedan);
          return '<div class="hijo"><div class="t"><span>' + r[0] + "</span><b>" + r[1] + '</b></div><div class="barra"><i style="width:' + (100 * quedan / maxA).toFixed(1) + '%"></i></div></div>';
        }).join("") + "</div></div>";
    }
    cont.innerHTML = h;
  }

  /* ---------- Para la hoja ---------- */
  function resumenHoja(res, lang) {
    var t = TX[lang], f = t.filas, filas = [];
    if (res.D > 0) filas.push([f.casa + " · " + f.anios(res.N, res.tasa), usd(res.D)]);
    if (res.k > 0) filas.push([res.A > 0 ? f.hijos(res.hijos, res.E) : f.hijosPasaron(res.hijos, res.E), ""]);
    if (res.G > 0) filas.push(res.A > 0 ? [f.gasto(res.G, res.A), usd(res.familiaHoy)] : [f.gastoNo, usd(0)]);
    if (res.O > 0) filas.push([f.otras, usd(res.O)]);
    if (res.P > 0) filas.push([f.tiene, "− " + usd(res.P)]);
    res.avisos.forEach(function (a) { filas.push([t.avisos[a], ""]); });
    return {
      titulo: t.titulo,
      filas: filas,
      totales: res.hitos.map(function (m) { return [etiquetaHito(m, res, t), usd(m.valor)]; }),
      altoMinimo: res.k * 52 + 200,
      dibujar: function (ctx, x, y, w, h) { graficaCanvas(ctx, x, y, w, h, res, t); }
    };
  }

  function graficaCanvas(ctx, x, y, w, h, res, t) {
    var izq = x, casaW = 0;
    if (res.D > 0) { casaW = Math.min(170, w * 0.2); casaCanvas(ctx, x, y + 6, casaW, 1); izq = x + casaW + 30; }
    var ww = x + w - izq;
    ctx.textBaseline = "alphabetic";
    // Barras por hijo (años)
    var yb = y + 8, maxA = Math.max(1, res.A);
    ctx.font = "bold 27px Helvetica, Arial, sans-serif";
    res.hijos.forEach(function (hj) {
      var r = t.hijoRot(hj, hj.anios);
      ctx.fillStyle = "#1b1b22"; ctx.fillText(r[0] + " · " + r[1], izq, yb + 22);
      ctx.fillStyle = "#ececf0"; ctx.fillRect(izq, yb + 32, ww, 12);
      ctx.fillStyle = MIEL; ctx.fillRect(izq, yb + 32, ww * hj.anios / maxA, 12);
      yb += 52;
    });
    // Línea del total
    var gy = yb + 12, gh = y + h - gy - 36, max = 1;
    if (gh < 80) gh = 80;
    res.serie.forEach(function (p) { if (p.total > max) max = p.total; });
    function X(tt) { return izq + ww * tt / res.T; }
    function Y(v) { return gy + gh * (1 - v / max); }
    ctx.strokeStyle = "#c9c9d1"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(izq, Y(0)); ctx.lineTo(izq + ww, Y(0)); ctx.stroke();
    ctx.fillStyle = "rgba(34,211,238,.18)";
    ctx.beginPath(); ctx.moveTo(X(0), Y(0));
    res.serie.forEach(function (p) { ctx.lineTo(X(p.t), Y(p.total)); });
    ctx.lineTo(X(res.T), Y(0)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#0e9fb8"; ctx.lineWidth = 5; ctx.lineJoin = "round";
    ctx.beginPath();
    res.serie.forEach(function (p, i) { if (i) ctx.lineTo(X(p.t), Y(p.total)); else ctx.moveTo(X(p.t), Y(p.total)); });
    ctx.stroke();
    ctx.font = "25px Helvetica, Arial, sans-serif"; ctx.fillStyle = "#55555f";
    ctx.textAlign = "left"; ctx.fillText(t.anio + " 0", izq, Y(0) + 30);
    ctx.textAlign = "right"; ctx.fillText(t.anio + " " + res.T, izq + ww, Y(0) + 30);
    ctx.textAlign = "left";
    res.hitos.forEach(function (m) {
      if (m.t > res.T) return;
      ctx.fillStyle = MIEL; ctx.beginPath(); ctx.arc(X(m.t), Y(m.valor), 8, 0, 7); ctx.fill();
    });
  }

  RC.herramientas.calculo = {
    id: "calculo",
    version: "calculo-v1-2026-11-13",
    textos: TX,
    vacio: function () { return { deuda: "", anios: "", tasa: "", hijos: 0, edades: [], tope: 18, gasto: "", aniosGasto: "", otras: "", tiene: "", ejemplo: false }; },
    /* Para «Abrir en el navegador»: los números van en el # de la dirección (el # no viaja al servidor). */
    aHash: function (e) {
      var p = [["d", e.deuda], ["n", e.anios], ["t", e.tasa], ["k", e.hijos], ["h", (e.edades || []).join(",")], ["e", e.tope],
        ["g", e.gasto], ["ag", e.aniosGasto], ["o", e.otras], ["p", e.tiene], ["x", e.ejemplo ? 1 : ""]];
      return p.filter(function (x) { return x[1] !== "" && x[1] != null && x[1] !== 0; })
        .map(function (x) { return x[0] + "=" + encodeURIComponent(x[1]); }).join("&");
    },
    deHash: function (h) {
      var q = {};
      String(h || "").replace(/^#/, "").split("&").forEach(function (kv) {
        var i = kv.indexOf("="); if (i > 0) q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
      });
      if (!(q.d || q.g || q.o)) return null;
      function d(v) { return String(v || "").replace(/[^0-9]/g, "").slice(0, 9); }
      var k = Math.max(0, Math.min(6, parseInt(q.k, 10) || 0));
      return {
        deuda: d(q.d), anios: d(q.n).slice(0, 2), tasa: String(q.t || "").replace(/[^0-9.]/g, "").slice(0, 5),
        hijos: k, edades: String(q.h || "").split(",").slice(0, k).map(function (v) { return d(v).slice(0, 2); }),
        tope: [18, 21, 22].indexOf(+q.e) >= 0 ? +q.e : 18, gasto: d(q.g), aniosGasto: d(q.ag).slice(0, 2),
        otras: d(q.o), tiene: d(q.p), ejemplo: q.x === "1"
      };
    },
    /* El ejemplo del video: US$300,000 a 30 años al 6.5 % fijo. Familia inventada. */
    ejemplo: function () { return { deuda: "300000", anios: "30", tasa: "6.5", hijos: 2, edades: ["4", "9"], tope: 18, gasto: "3500", otras: "", tiene: "", ejemplo: true }; },
    casaSVG: casaSVG,
    pintarFormulario: pintarFormulario,
    calcular: calcular,
    pintarResultado: pintarResultado,
    resumenHoja: resumenHoja,
    _saldoCasa: saldoCasa
  };
})(typeof window !== "undefined" ? window : globalThis);
