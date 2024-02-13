$(document).ready(function () {

  
    /*********    Year    *********/
    var now = new Date();
    year = now.getFullYear();
    $('.year').html(year);

    /*********  Fixed header  *********/

    $(window).scroll(function () {
      var scroll_position = $(window).scrollTop();
      var mobil_width = $(window).width();
      if (mobil_width > 300) {
        if (scroll_position > 600) {
          $('.nav').addClass('sticky');
        } else {
          $('.nav').removeClass('sticky');
        }
      } else {
        $('.nav').removeClass('sticky');
      }
    });

    /*********  Slider  *********/
    
    const tabs = document.getElementsByClassName('tab');  
    const sections = document.getElementsByClassName('tab-content'); 
    
    [...tabs].forEach(tab => tab.addEventListener('click', tabClick));
    
    function tabClick(event) {
      const tabId = event.target.dataset.id;
    
      [...tabs].forEach((tab, i) => {
        tab.classList.remove('active');
        sections[i].classList.remove('active');
      })
    
      tabs[tabId - 1].classList.add('active');
      sections[tabId - 1].classList.add('active');
    }

    
    /*********  Slider-testimonials  *********/

    function getScreenSize() {
      const w = window;
      const d = document;
      const e = d.documentElement;
      const g = d.getElementsByTagName('body')[0];
    
      const width = w.innerWidth || e.clientWidth || g.clientWidth;
      const height = w.innerHeight || e.clientHeight || g.clientHeight;
    
      return {
        width,
        height
      };
    }
    
    const slides = document.querySelectorAll(
      '.js-testimonials-slider .js-slider-item',
    );
    
    const ROOT_SELECTOR = '.js-testimonials-slider';
    
    const ORDERED_SLIDES = Array.from(slides).map((slide) => {
      return slide.getAttribute('data-type');
    });
    
    const types = [...new Set(ORDERED_SLIDES)];
    
    let testimonialsConfig = {};
    
    types.forEach((type) => {
      testimonialsConfig[type] = {
        start: ORDERED_SLIDES.indexOf(type),
        total: ORDERED_SLIDES.filter((item) => item === type).length,
      };
    });
    
    const DURATION = 300;
    
    const KEYCODE_RIGHT_ARROW = 39;
    const KEYCODE_LEFT_ARROW = 37;
    
    
    class Testimonials {
      constructor() {
        this.onResizeWindow = () => {
          const updatedScreenWidth = getScreenSize().width;
          if (this.screenWidth === updatedScreenWidth) {
            return;
          }
          this.screenWidth = updatedScreenWidth;
          // timeout to avoid transition effect after resize
          setTimeout(() => {
            this.updateActiveItem(this.slider.innerElements, this.slider.currentSlide);
            this.updateHeightWrap();
          }, DURATION);
        };
        this.onKeyDown = (e) => {
          if (e.keyCode === KEYCODE_LEFT_ARROW) {
            this.slider.prev();
          }
          if (e.keyCode === KEYCODE_RIGHT_ARROW) {
            this.slider.next();
          }
        };
        this.slider = {
          currentSlide: 0,
          innerElements: [],
          destroy: () => {},
          prev: () => {},
          next: () => {},
          goTo: () => {},
        };
        const testimonialsContainer = document.querySelector('.js-testimonials');
        if (testimonialsContainer) {
          this.container = testimonialsContainer;
        }
        const currentNumberWrap = this.container.querySelector('[data-current-number]');
        const totalNumberWrap = this.container.querySelector('[data-total-number]');
        if (currentNumberWrap && totalNumberWrap) {
          this.currentNumberWrap = currentNumberWrap;
          this.totalNumberWrap = totalNumberWrap;
        }
        this.screenWidth = getScreenSize().width;
      }
      isMobile() {
        return window.matchMedia('(max-width: 767px)').matches;
      }
      getHeightActiveItem() {
        const active = this.container.querySelector('.js-slider-item[data-active="true"]');
        if (active) {
          return active.offsetHeight;
        }
        return null;
      }
      updateHeightWrap() {
        const testimonialsContainer = document.querySelector('.js-testimonials');
        const height = this.getHeightActiveItem();
        const slidesWrapper = this.container.querySelector(ROOT_SELECTOR);
        if (height && slidesWrapper) {
          slidesWrapper.style.height = height + 'px';
        }
      }
      scrollTabs(activeTab) {
        const wrapper = activeTab.closest('.index-testimonials__tabs-wrap');
        if (wrapper) {
          const activeTabLeftPos = activeTab.offsetLeft;
          const activeTabRightPos = activeTab.offsetLeft + activeTab.offsetWidth;
          const rect = wrapper.getBoundingClientRect();
          if (activeTabRightPos > rect.right) {
            wrapper.scrollLeft =
              activeTabRightPos - rect.right + activeTab.offsetWidth;
          } else if (activeTabLeftPos <= rect.left ||
            wrapper.scrollLeft > activeTabLeftPos) {
            wrapper.scrollLeft = Math.abs(activeTabLeftPos);
          }
        }
      }
      updateTabsState(currentTabState) {
        if (currentTabState !== this.activeTab.getAttribute('data-type')) {
          this.activeTab.removeAttribute('data-active');
          const activeTab = this.container.querySelector(`.js-testimonials-tab[data-type="${currentTabState}"]`);
          if (activeTab) {
            activeTab.setAttribute('data-active', 'true');
            this.activeTab = activeTab;
            if (this.isMobile()) {
              this.scrollTabs(activeTab);
            }
          }
        }
      }
      updateActiveItem(innerElements, current) {
        const items = document.querySelectorAll('.js-slider-item');
        items.forEach((item) => {
          item.setAttribute('data-active', 'false');
        });
        const currentSlide = innerElements[current];
        currentSlide.setAttribute('data-active', 'true');
        const currentType = currentSlide.getAttribute('data-type');
        if (currentType) {
          this.container.setAttribute('data-type', currentType);
          this.currentType = currentType;
        }
      }
      loadImages() {
        const lazyImages = document.querySelectorAll(`${ROOT_SELECTOR} img[data-lazy-src]`);
        const promises = [];
        lazyImages.forEach((item) => {
          const src = item.getAttribute('data-lazy-src') || '';
          const srcSet = item.getAttribute('data-lazy-srcset') || '';
          item.setAttribute('src', src);
          item.setAttribute('srcset', srcSet);
          item.removeAttribute('data-lazy-src');
          item.removeAttribute('data-lazy-srcset');
          const onLoadPromise = new Promise((resolve) => {
            item.onload = () => {
              resolve();
            };
            item.onerror = () => {
              resolve();
            };
          });
          promises.push(onLoadPromise);
        });
        Promise.all(promises).then(() => {
          this.updateHeightWrap();
        });
      }
      onChangeSlide(slider) {
        const currentSlide = slider.currentSlide;
        this.updateTabsState(ORDERED_SLIDES[currentSlide]);
        this.updateActiveItem(slider.innerElements, currentSlide);
        this.updateCounters();
        this.loadImages();
        // sendEvent('page:main', 'change_slide_testimonials', ORDERED_SLIDES[currentSlide]);
      }
      getInstanceSlider() {
        const self = this;
        return new Siema({
          selector: ROOT_SELECTOR,
          duration: DURATION,
          easing: 'ease-out',
          perPage: 1,
          startIndex: 0,
          draggable: true,
          multipleDrag: false,
          threshold: 20,
          loop: true,
          rtl: false,
          onInit: function () {
            self.updateActiveItem(this.innerElements, 0);
            self.updateHeightWrap();
          },
          onChange: function () {
            self.onChangeSlide(this);
          },
        });
      }
      initControls() {
        const btnSliderLeft = this.container.querySelector('.js-testimonials [data-control="prev"]');
        const btnSliderRight = this.container.querySelector('.js-testimonials [data-control="next"]');
        if (btnSliderLeft && btnSliderRight) {
          btnSliderLeft.addEventListener('click', () => {
            if (this.slider.prev) {
              this.slider.prev();
            }
          });
          btnSliderRight.addEventListener('click', () => {
            this.slider.next();
          });
        }
      }
      updateCounters() {
        const totalInToolkit = testimonialsConfig[this.currentType].total;
        const currentInToolkit = this.slider.currentSlide - testimonialsConfig[this.currentType].start;
        this.totalNumberWrap.innerText = totalInToolkit.toString();
        this.currentNumberWrap.innerText = (currentInToolkit + 1).toString();
      }
      initTabs() {
        for (const property in testimonialsConfig) {
          const startIndex = testimonialsConfig[property].start;
          const tab = this.container.querySelector(`.js-testimonials-tab[data-type="${property}"]`);
          if (tab) {
            tab.addEventListener('click', () => this.slider.goTo(startIndex));
          }
        }
        const activeTab = this.container.querySelector('.js-testimonials-tab[data-active]');
        if (activeTab) {
          this.activeTab = activeTab;
          this.currentType = activeTab.getAttribute('data-type') || '';
        }
      }
      init() {
        this.slider = this.getInstanceSlider();
        window.addEventListener('resize', this.onResizeWindow);
        window.addEventListener('keydown', this.onKeyDown);
        this.initTabs();
        this.initControls();
        this.updateCounters();
        this.container.classList.add('initialized');
      }
    }
    window.Testimonials = Testimonials;

    const testimonialsSlider = new Testimonials();
      testimonialsSlider.init();
///////


    /*********  Slick  *********/

    $(".variable").slick({
      dots: false,
      focusOnSelect: false,
      infinite: false,
      variableWidth: true,
      slidesToShow: 2,
      slidesToScroll: 2,
      // breakpoint: 800,
      prevArrow: $('.prev'),
      nextArrow: $('.next'),
      // centerMode: true,
      centerPadding: '40px',
      // beforeChange: (slick, currentSlide, nextSlide) => {
      //   debugger
      //   slick;
      //   currentSlide;
      //   nextSlide;
      // },
      responsive: [{
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true
        }
      }, {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: false,
          infinite: true
        }
      }]
    });

    const swiper = new Swiper('.swiper', {
      slidesPerView: "auto",
      spaceBetween: 16,
      autoHeight: true,
      pagination: {
        el: ".swiper-pagination",
        // dynamicBullets: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });

});
