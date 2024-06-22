(function FAQ(SectionsDesign) {
  'use strict';
  
  if (SectionsDesign.faq) return;
  SectionsDesign.faq = {};
  
  var support = getSupport();

  var init = function() {
    var configNodes = Array.from(document.querySelectorAll('[data-faq-config]'));
    
    configNodes.forEach(configNode => {
      var section = compose(publicAPI, setEvents, getBlocks, getConfig)(configNode);
      SectionsDesign.faq[section.id] = section;
    });
  }
  
  init();
  
  function publicAPI(config) {
    return {
      id: config.sectionId,
      config: config,
      blocks: zipObj(config.blockIds, config.blocks),
      init: init
    }
  }

  function blockEvents(block) {
    if (block.trigger.hasAttribute('data-faq-init')) return block;
    
    block.trigger.setAttribute('data-faq-init', true);
    block.trigger.addEventListener('click', triggerClick);
                                   
    function triggerClick() {
      toggle(block);
    }

    return block;
  }

  function toggle(block) {
    block.collapsed ? expand(block) : collapse(block);
    return block;
  }

  function expand(block) {
    block.button.setAttribute('aria-expanded', 'true');
    block.panel.removeAttribute('hidden');
    animate(block.panel, 'normal');
    return block;
  }

  function collapse(block) {
    block.button.setAttribute('aria-expanded', 'false');
    block.panel.setAttribute('hidden', '');
    animate(block.panel, 'reverse');
    return block;
  }

  function isCollapsed(block) {
    return block.button.getAttribute('aria-expanded') === 'false';
  }

  function animate(element, direction) { 
    if (!support.WebAnimations) return;

    element.setAttribute('data-is-animating', true);

    element.animate([
      { height: 0 },
      { height: element.offsetHeight + 'px' }
    ], {
      duration: 240,
      fill: 'both',
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      direction: direction
    }).onfinish = function() {
      element.removeAttribute('data-is-animating');
      this.cancel();
    };
  }

  function getBlocks(config) {
    config.blocks = config.blockIds.map(block);
    return config;
  }

  function block(blockId) {
    return {
      trigger: document.querySelector('[data-faq-trigger="' + blockId + '"]'),
      button: document.querySelector('[data-faq-button="' + blockId + '"]'),
      panel: document.querySelector('[data-faq-panel="' + blockId + '"]'),

      get collapsed() { return isCollapsed(this) },
      select: function() { return expand(this) },
      deselect: function() { return collapse(this) }
    }
  }

  function setEvents(config) {
    config.blocks.forEach(blockEvents);
    return config;
  }

  function getConfig(node) {
    return JSON.parse(node.innerHTML);
  }

  function getSupport() {
    return {
      WebAnimations: (typeof Element.prototype.animate === 'function')
    }
  }

  function zipObj(keys, values) {
    return keys.reduce(function(acc, key, idx) {
      acc[key] = values[idx];
      return acc;
    }, {});
  }

  function compose() {
    var funcs = Array.prototype.slice.call(arguments).reverse();
    return function() {
      return funcs.slice(1).reduce(function(res, fn) {
        return fn(res);
      }, funcs[0].apply(undefined, arguments));
    };
  }
  
})(window.SectionsDesign = window.SectionsDesign || {});
