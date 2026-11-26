/* ==========================================================================
   GUÍA INTERACTIVA (Driver.js)  ·  Explocion Arena
   --------------------------------------------------------------------------
   Este archivo es lo único que necesitas editar para cambiar la guía:
     1. TEXTOS      → botones y mensajes generales.
     2. AJUSTES     → colores del fondo oscuro y comportamiento.
     3. PASOS_LOGIN → pasos de la pantalla de acceso (usuario y contraseña).
     4. PASOS_JUEGO → pasos de la zona de juegos y cómo se juega.

   Cada paso tiene:
     element     → selector CSS del elemento que se resalta (#id o .clase).
     popover     → title, description (admite <br> y <b>), side
                   (top | bottom | left | right) y align (start | center | end).

   Para agregar un paso, copia uno y cambia el selector y los textos.
   Si el elemento no está visible en pantalla, ese paso se salta solo.
   Documentación de Driver.js: https://driverjs.com/docs/installation
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- 1. TEXTOS ---------- */
    var TEXTOS = {
        siguiente: 'Siguiente →',
        anterior: '← Anterior',
        listo: '¡Entendido!',
        progreso: 'Paso {{current}} de {{total}}'
    };

    /* ---------- 2. AJUSTES ---------- */
    var AUTO_INICIAR = true;          // false = la guía solo se abre con el botón "Ver guía"
    var AJUSTES = {
        overlayColor: '#101215',      // color del fondo que oscurece la página
        overlayOpacity: 0.78,
        stagePadding: 6,              // margen alrededor del elemento resaltado
        stageRadius: 10,
        smoothScroll: true,
        allowClose: true,
        popoverClass: 'tour-arena'    // estilos en tour.css
    };
    var CLAVE_LOGIN = 'arenaGuiaLoginVista';   // marca guardada en el navegador
    var CLAVE_JUEGO = 'arenaGuiaJuegoVistaV2';

    /* ---------- 3. PASOS DE LA PANTALLA DE ACCESO ---------- */
    var PASOS_LOGIN = [
        {
            element: '#usuario',
            popover: {
                title: 'Tu nick name',
                description: 'Escribe el apodo con el que aparecerás en el ranking (mínimo 3 caracteres).<br>Si es nuevo, se crea al entrar. Si ya existe, entras con su contraseña.',
                side: 'bottom', align: 'center'
            }
        },
        {
            element: '#clave',
            popover: {
                title: 'Tu contraseña',
                description: 'Elige una contraseña de al menos 4 caracteres.<br>Úsala siempre con el mismo nick name para volver a entrar a tu cuenta.',
                side: 'bottom', align: 'center'
            }
        }
    ];

    /* ---------- 4. PASOS DE LA ZONA DE JUEGOS ---------- */
    function segundosDeJuego() {
        // Usa el tiempo real definido en index.html (constante TIEMPO).
        var t = (typeof TIEMPO === 'number') ? TIEMPO : 100;
        return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
    }

    var PASOS_JUEGO = [
        {
            element: '.card-five',
            popover: function () {
                // Usa los valores reales definidos en index.html.
                var inicio = (typeof RELOJ_INICIO === 'number') ? RELOJ_INICIO : 15;
                var bono = (typeof RELOJ_BONUS === 'number') ? RELOJ_BONUS : 10;
                var penal = (typeof RELOJ_PENAL === 'number') ? RELOJ_PENAL : 5;
                return {
                    title: '⏱ Modo Contra reloj',
                    description:
                        '¡Aquí cada segundo cuenta!<br><br>' +
                        '🚀 Empiezas con <b>' + inicio + ' segundos</b>.<br>' +
                        '✅ Cada acierto suma <b>+' + bono + ' s</b>.<br>' +
                        '❌ Cada error resta <b>−' + penal + ' s</b>.<br>' +
                        '🏁 La partida termina cuando el reloj llega a 0.',
                    side: 'top', align: 'center'
                };
            }
        },
        {
            element: '.card-one .character-art',
            popover: function () {
                return {
                    title: 'Cómo se juega',
                    description:
                        '<b>1.</b> Toca la imagen de una categoría.<br>' +
                        '<b>2.</b> Mira al personaje y responde las preguntas antes de que se acabe el tiempo (' + segundosDeJuego() + ').<br>' +
                        '<b>3.</b> Al terminar puede aparecer un personaje sorpresa.<br>' +
                        '<b>4.</b> Tu puntaje y tu tiempo entran al ranking de esa categoría. Gana quien acierta más y tarda menos.',
                    side: 'top', align: 'center'
                };
            }
        }
    ];

    /* ======================================================================
       A partir de aquí no hace falta modificar nada.
       ====================================================================== */
    function visible(sel) {
        var el = document.querySelector(sel);
        return !!(el && el.getClientRects().length);
    }

    function marcar(clave) { try { localStorage.setItem(clave, '1'); } catch (e) {} }
    function vista(clave) { try { return localStorage.getItem(clave) === '1'; } catch (e) { return false; } }

    function crearGuia(pasos, clave) {
        if (!window.driver || !window.driver.js || !window.driver.js.driver) return null; // librería no cargó
        var validos = pasos.filter(function (p) { return visible(p.element); }).map(function (p) {
            var pop = typeof p.popover === 'function' ? p.popover() : p.popover;
            return { element: p.element, popover: pop };
        });
        if (!validos.length) return null;
        var opciones = {};
        Object.keys(AJUSTES).forEach(function (k) { opciones[k] = AJUSTES[k]; });
        opciones.showProgress = true;
        opciones.progressText = TEXTOS.progreso;
        opciones.nextBtnText = TEXTOS.siguiente;
        opciones.prevBtnText = TEXTOS.anterior;
        opciones.doneBtnText = TEXTOS.listo;
        opciones.steps = validos;
        opciones.onDestroyed = function () { marcar(clave); };
        return window.driver.js.driver(opciones);
    }

    function lanzar(pasos, clave, forzar) {
        if (!forzar && (!AUTO_INICIAR || vista(clave))) return;
        var guia = crearGuia(pasos, clave);
        if (guia) setTimeout(function () { guia.drive(); }, 350);
    }

    window.TourArena = {
        iniciarLogin: function (forzar) { lanzar(PASOS_LOGIN, CLAVE_LOGIN, forzar); },
        iniciarJuego: function (forzar) { lanzar(PASOS_JUEGO, CLAVE_JUEGO, forzar); }
    };

    // Botones "Ver guía" (atributo data-tour="login" o data-tour="juego")
    document.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('[data-tour]');
        if (!b) return;
        if (b.getAttribute('data-tour') === 'login') window.TourArena.iniciarLogin(true);
        else window.TourArena.iniciarJuego(true);
    });

    // Al cargar la página: abre la guía de la pantalla que se esté viendo.
    var inicio = document.getElementById('inicio');
    if (inicio && inicio.style.display !== 'none') window.TourArena.iniciarLogin(false);
    else window.TourArena.iniciarJuego(false);
})();
