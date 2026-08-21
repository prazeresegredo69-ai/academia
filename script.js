// script.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Countdown Timer ---
    // Timer de exemplo: 2 horas, 45 minutos e 30 segundos a partir de agora.
    // Para urgência real, considere usar localStorage ou um horário fixo de término do dia.

    let timeInSeconds = (2 * 3600) + (45 * 60) + 30; // 2h 45m 30s

    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateTimer() {
        if (timeInSeconds <= 0) {
            timeInSeconds = 0;
            // Opcional: tratar expiração do timer (ex: esconder oferta)
        }

        const h = Math.floor(timeInSeconds / 3600);
        const m = Math.floor((timeInSeconds % 3600) / 60);
        const s = Math.floor(timeInSeconds % 60);

        if(hoursEl) hoursEl.textContent = h.toString().padStart(2, '0');
        if(minutesEl) minutesEl.textContent = m.toString().padStart(2, '0');
        if(secondsEl) secondsEl.textContent = s.toString().padStart(2, '0');

        if (timeInSeconds > 0) {
            timeInSeconds--;
        }
    }

    if (hoursEl && minutesEl && secondsEl) {
        setInterval(updateTimer, 1000);
        updateTimer();
    }


    // --- 2. FAQ Accordion ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isActive = header.classList.contains('active');

            // Fecha todos os acordeões abertos (remova se quiser múltiplos abertos)
            document.querySelectorAll('.accordion-header').forEach(btn => {
                btn.classList.remove('active');
                btn.nextElementSibling.style.maxHeight = null;
            });

            // Se não estava ativo, abre
            if (!isActive) {
                header.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // --- 3. Smooth Scroll para Links Âncora ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if(targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 4. Repassa UTM/click IDs da landing page para o checkout (GGCheckout) e identifica o plano ---
    const checkoutPlans = {
        '/checkout/v5/3SqygYB4Ihqs7MpPk0NL': { name: 'Plano Completo', value: 27.90 },
        '/checkout/v5/5r5VaPeez8BlunAXvyna': { name: 'Plano Básico', value: 17.90 }
    };
    const checkoutLinks = document.querySelectorAll('a[href*="ggcheckout.app"]');
    const currentParams = new URLSearchParams(window.location.search);

    checkoutLinks.forEach(link => {
        // Casa pelo pathname (nao pela URL completa), pois o script da UTMify
        // pode reescrever o href com querystring antes deste codigo rodar.
        const plan = checkoutPlans[new URL(link.href).pathname];

        if ([...currentParams.keys()].length) {
            const url = new URL(link.href);
            currentParams.forEach((value, key) => {
                if (!url.searchParams.has(key)) {
                    url.searchParams.set(key, value);
                }
            });
            link.href = url.toString();
        }

        // Dispara InitiateCheckout no clique, identificando qual dos dois planos foi escolhido
        link.addEventListener('click', () => {
            if (typeof fbq !== 'function') return;

            if (plan) {
                fbq('track', 'InitiateCheckout', {
                    content_name: plan.name,
                    value: plan.value,
                    currency: 'BRL'
                });
            } else {
                fbq('track', 'InitiateCheckout');
            }
        });
    });

});