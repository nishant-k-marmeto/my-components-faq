class FAQItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const expanded = this.getAttribute('expanded') === 'true';
    this.render(expanded);
    this.addEventListeners();
  }

  render(expanded) {
    this.shadowRoot.innerHTML = `
      <style>
        .faq-title {
          border-bottom: 1px solid var(--border-color);
          font-size: var(--title-font-size);
          color: var(--question-color);
        }

        .faq-panel {
          will-change: height;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--panel-bg);
          color: var(--answer-color);
        }

        .faq-button {
          font: inherit;
          background: transparent;
          border: 0;
        }

        .faq-icon {
          width: clamp(12px, 0.65em, 20px);
          height: clamp(12px, 0.65em, 20px);
          min-width: clamp(12px, 0.65em, 20px);
          margin-left: 1rem;
        }

        .faq-icon-minus {
          transition: transform 240ms cubic-bezier(0.4, 0.0, 0.2, 1);
          transform-origin: 50% 50%;
        }

        .faq-button[aria-expanded="true"] .faq-icon-minus {
          transform: rotate(90deg);
        }

        .faq-panel * {
          color: inherit;
        }

        .faq-panel[data-is-animating] {
          display: block!important;
        }
      </style>
      <h2 class="faq-title m-0 p-0">
        <button class="faq-button flex items-center justify-between w-full text-left m-0 p-4 cursor-pointer" aria-expanded="${expanded}">
          <span>${this.getAttribute('title')}</span>
          <svg class="faq-icon" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path class="faq-icon-minus" fill="currentColor" d="M8 0v14H6V0z"></path>
            <path fill="currentColor" d="M0 6h14v2H0z"></path>
          </svg>
        </button>
      </h2>
      <div class="faq-panel rte overflow-hidden custom-bg" ${expanded ? '' : 'hidden'}>
        <div class="faq-wrap p-4">${this.getAttribute('content')}</div>
      </div>
    `;
  }

  addEventListeners() {
    const button = this.shadowRoot.querySelector('.faq-button');
    const panel = this.shadowRoot.querySelector('.faq-panel');
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        this.collapse(panel, button);
      } else {
        this.expand(panel, button);
      }
    });
  }

  expand(panel, button) {
    button.setAttribute('aria-expanded', 'true');
    panel.removeAttribute('hidden');
    this.animate(panel, 'normal');
  }

  collapse(panel, button) {
    button.setAttribute('aria-expanded', 'false');
    panel.setAttribute('hidden', '');
    this.animate(panel, 'reverse');
  }

  animate(element, direction) {
    const support = { WebAnimations: (typeof Element.prototype.animate === 'function') };
    if (!support.WebAnimations) return;
    element.setAttribute('data-is-animating', true);
    element.animate([{ height: 0 }, { height: element.offsetHeight + 'px' }], {
      duration: 240,
      fill: 'both',
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      direction: direction,
    }).onfinish = function () {
      element.removeAttribute('data-is-animating');
      this.cancel();
    };
  }
}

class FAQSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const backgroundColor = this.getAttribute('background-color');
    const panelBg = this.getAttribute('panel-bg');
    const borderColor = this.getAttribute('border-color');
    const questionColor = this.getAttribute('question-color');
    const answerColor = this.getAttribute('answer-color');
    const titleFontSizeMin = this.getAttribute('title-font-size-min');
    const titleFontSizeMax = this.getAttribute('title-font-size-max');
    const maxWidth = this.getAttribute('max-width');
    const marginTop = this.getAttribute('margin-top');
    const marginBottom = this.getAttribute('margin-bottom');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --background-color: ${backgroundColor};
          --panel-bg: ${panelBg};
          --border-color: ${borderColor};
          --question-color: ${questionColor};
          --answer-color: ${answerColor};
          --title-font-size: clamp(${titleFontSizeMin}, calc(${titleFontSizeMin} + (${titleFontSizeMax} - ${titleFontSizeMin}) * ((100vw - 25rem) / (64 - 25))), ${titleFontSizeMax});
        }
        .faq-container {
          max-width: ${maxWidth};
          margin: ${marginTop}rem auto ${marginBottom}rem;
          background: var(--background-color);
        }
      </style>
      <div class="faq-container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('marmeto-faq-item', FAQItem);
customElements.define('marmeto-faq-section', FAQSection);
