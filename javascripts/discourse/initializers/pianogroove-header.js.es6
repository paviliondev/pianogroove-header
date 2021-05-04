import { withPluginApi } from 'discourse/lib/plugin-api';
import { scheduleOnce, next } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { observes, on } from "discourse-common/utils/decorators";

function applyScrolled() {
  return $(window).scrollTop() > 0 || $('body[class*=user-], body[class*=admin-], body[class*=private_message]').length
}

function setBodyClass() {
  if (applyScrolled()) {
    $("body").addClass("scrolled");
  } else {
    $("body").removeClass("scrolled");
  }
}

export default {
  name: 'pianogroove-initialzer',
  initialize() {
    scheduleOnce('afterRender', setBodyClass)
    $(window).scroll(() => setBodyClass());
    
    withPluginApi('0.8.32', api => {
      api.onPageChange(() => scheduleOnce('afterRender', setBodyClass));
      
      api.modifyClass('component:site-header', {
        router: service(),

        @on('didInsertElement')
        @observes('router.currentRouteName')
        pathChanged() {
          const currentPath = this.router.currentRouteName;
          const parentPath = currentPath.split('.')[0];

          if (parentPath.indexOf('user') > -1 || parentPath.indexOf('preferences') > -1) {
            this.queueRerender();
          }
        },
      });
      
      api.reopenWidget('home-logo', {
        buildKey: (attrs) => `home-logo`,
        
        defaultState() {
          return {
            logoUrl: this.siteSettings.site_logo_url,
            mobileLogoUrl: this.siteSettings.site_mobile_logo_url,
            smallLogoUrl: this.siteSettings.site_logo_small_url
          }
        },
        
        scrolledState() {
          return {
            logoUrl: settings.scrolled_logo_url,
            mobileLogoUrl: settings.scrolled_mobile_logo_url,
            smallLogoUrl: settings.scrolled_small_logo_url
          }
        },
        
        didRenderWidget() {
          next(() => {
            scheduleOnce('afterRender', () => {
              this.updateState();
            });
          });
          $(window).scroll(() => {
            this.updateState();
          });
        },
        
        updateState() {
          let oldState = this.state;
          let state;

          if (applyScrolled()) {
            state = this.scrolledState();
          } else {
            state = this.defaultState();
          }

          if (JSON.stringify(oldState) !== JSON.stringify(state)) {
            Object.keys(state).forEach(k => {
              this.state[k] = state[k];
            });
            this.scheduleRerender();
          }
        },
        
        logoUrl() {
          return this.state.logoUrl;
        },

        mobileLogoUrl() {
          return this.state.mobileLogoUrl;
        },

        smallLogoUrl() {
          return this.state.smallLogoUrl;
        }
      })
    });
  }
}