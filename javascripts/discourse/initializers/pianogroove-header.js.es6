import { withPluginApi } from 'discourse/lib/plugin-api';

function applyScrolled() {
  return $(window).scrollTop() > 0 || $('body[class*=user-], body[class*=admin-]').length
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
    Ember.run.scheduleOnce('afterRender', setBodyClass)
    $(window).scroll(() => setBodyClass());
    
    withPluginApi('0.8.32', api => {
      api.onPageChange(() => Ember.run.scheduleOnce('afterRender', setBodyClass));
      
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
        
        init() {
          $(window).scroll(() => {
            let state;
            
            if(applyScrolled()) {
              state = this.scrolledState();
            } else {
              state = this.defaultState();
            }
            
            Object.keys(state).forEach(k => {
              this.state[k] = state[k];
            });
            
            this.scheduleRerender();
          });
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