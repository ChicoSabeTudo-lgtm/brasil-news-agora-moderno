/**
 * GALERIA DE IMAGENS MODERNA - CHICO SABE TUDO
 * JavaScript para navegação, interações e responsividade
 */

class ImageGallery {
    constructor(containerId, images) {
        this.container = document.getElementById(containerId);
        this.images = images || [];
        this.currentIndex = 0;
        this.isFullscreen = false;
        
        if (!this.container) {
            console.error('Container da galeria não encontrado:', containerId);
            return;
        }
        
        if (this.images.length === 0) {
            console.warn('Nenhuma imagem fornecida para a galeria');
            return;
        }
        
        this.init();
    }
    
    init() {
        this.createGalleryStructure();
        this.bindEvents();
        this.updateDisplay();
        this.createThumbnails();
        
        // Precarregar próximas imagens
        this.preloadImages();
    }
    
    createGalleryStructure() {
        this.container.innerHTML = `
            <div class="gallery-main">
                <div class="main-image-container" id="mainImageContainer">
                    <img class="main-image" id="mainImage" alt="Imagem principal da galeria">
                    
                    <div class="image-overlay">
                        <p class="main-caption" id="mainCaption"></p>
                    </div>
                    
                    <button class="nav-button prev" id="prevButton" aria-label="Imagem anterior">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15,18 9,12 15,6"></polyline>
                        </svg>
                    </button>
                    
                    <button class="nav-button next" id="nextButton" aria-label="Próxima imagem">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9,18 15,12 9,6"></polyline>
                        </svg>
                    </button>
                    
                    <div class="image-counter" id="imageCounter"></div>
                </div>
            </div>
            
            <div class="thumbnails-container">
                <button class="thumbnails-nav prev" id="thumbsPrevButton" aria-label="Rolar miniaturas para esquerda">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                </button>
                
                <button class="thumbnails-nav next" id="thumbsNextButton" aria-label="Rolar miniaturas para direita">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                </button>
                
                <div class="thumbnails-list" id="thumbnailsList"></div>
            </div>
        `;
        
        // Obter referências dos elementos
        this.mainImage = this.container.querySelector('#mainImage');
        this.mainCaption = this.container.querySelector('#mainCaption');
        this.imageCounter = this.container.querySelector('#imageCounter');
        this.thumbnailsList = this.container.querySelector('#thumbnailsList');
        this.mainImageContainer = this.container.querySelector('#mainImageContainer');
    }
    
    bindEvents() {
        // Navegação principal
        this.container.querySelector('#prevButton').addEventListener('click', () => this.previousImage());
        this.container.querySelector('#nextButton').addEventListener('click', () => this.nextImage());
        
        // Navegação das miniaturas
        this.container.querySelector('#thumbsPrevButton').addEventListener('click', () => this.scrollThumbnails('left'));
        this.container.querySelector('#thumbsNextButton').addEventListener('click', () => this.scrollThumbnails('right'));
        
        // Teclado
        this.keyboardHandler = (e) => this.handleKeyboard(e);
        document.addEventListener('keydown', this.keyboardHandler);
        
        // Clique na imagem principal para tela cheia
        this.mainImageContainer.addEventListener('click', () => this.toggleFullscreen());
        
        // Touch/swipe para mobile
        this.bindTouchEvents();
        
        // Redimensionamento da janela
        this.resizeHandler = () => this.handleResize();
        window.addEventListener('resize', this.resizeHandler);
    }
    
    bindTouchEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        this.mainImageContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        this.mainImageContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Verificar se é um swipe horizontal
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.previousImage();
                } else {
                    this.nextImage();
                }
            }
        });
    }
    
    createThumbnails() {
        this.thumbnailsList.innerHTML = '';
        
        this.images.forEach((image, index) => {
            const thumbnailItem = document.createElement('div');
            thumbnailItem.className = 'thumbnail-item';
            
            thumbnailItem.innerHTML = `
                <div class="thumbnail-container ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <img class="thumbnail-image" src="${image.src}" alt="${image.caption || 'Miniatura ' + (index + 1)}">
                    <div class="thumbnail-caption">${image.caption || 'Imagem ' + (index + 1)}</div>
                </div>
            `;
            
            // Evento de clique na miniatura
            thumbnailItem.addEventListener('click', () => this.goToImage(index));
            
            this.thumbnailsList.appendChild(thumbnailItem);
        });
    }
    
    updateDisplay() {
        if (this.images.length === 0) return;
        
        const currentImage = this.images[this.currentIndex];
        
        // Atualizar imagem principal
        this.mainImage.src = currentImage.src;
        this.mainImage.alt = currentImage.caption || `Imagem ${this.currentIndex + 1}`;
        
        // Atualizar legenda
        this.mainCaption.textContent = currentImage.caption || `Imagem ${this.currentIndex + 1}`;
        
        // Atualizar contador
        this.imageCounter.textContent = `${this.currentIndex + 1} de ${this.images.length}`;
        
        // Atualizar miniaturas ativas
        this.updateActiveThumbnail();
        
        // Rolar para a miniatura ativa se necessário
        this.scrollToActiveThumbnail();
    }
    
    updateActiveThumbnail() {
        const thumbnails = this.thumbnailsList.querySelectorAll('.thumbnail-container');
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    scrollToActiveThumbnail() {
        const activeThumbnail = this.thumbnailsList.querySelector('.thumbnail-container.active');
        if (activeThumbnail) {
            const containerWidth = this.thumbnailsList.offsetWidth;
            const thumbnailLeft = activeThumbnail.offsetLeft;
            const thumbnailWidth = activeThumbnail.offsetWidth;
            
            const scrollLeft = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
            
            this.thumbnailsList.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }
    
    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateDisplay();
        this.addChangeEffect();
    }
    
    previousImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateDisplay();
        this.addChangeEffect();
    }
    
    goToImage(index) {
        if (index >= 0 && index < this.images.length) {
            this.currentIndex = index;
            this.updateDisplay();
            this.addChangeEffect();
        }
    }
    
    addChangeEffect() {
        this.mainImageContainer.classList.add('changing');
        setTimeout(() => {
            this.mainImageContainer.classList.remove('changing');
        }, 300);
    }
    
    scrollThumbnails(direction) {
        const scrollAmount = 200;
        const currentScroll = this.thumbnailsList.scrollLeft;
        
        if (direction === 'left') {
            this.thumbnailsList.scrollTo({
                left: currentScroll - scrollAmount,
                behavior: 'smooth'
            });
        } else {
            this.thumbnailsList.scrollTo({
                left: currentScroll + scrollAmount,
                behavior: 'smooth'
            });
        }
    }
    
    handleKeyboard(e) {
        if (!this.container.contains(document.activeElement) && !this.isFullscreen) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousImage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextImage();
                break;
            case 'Escape':
                if (this.isFullscreen) {
                    this.exitFullscreen();
                }
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.toggleFullscreen();
                break;
        }
    }
    
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }
    
    enterFullscreen() {
        this.isFullscreen = true;
        
        // Criar overlay de tela cheia
        const fullscreenOverlay = document.createElement('div');
        fullscreenOverlay.className = 'gallery-fullscreen';
        fullscreenOverlay.id = 'galleryFullscreen';
        
        // Clonar a galeria
        const galleryClone = this.container.cloneNode(true);
        galleryClone.id = 'galleryFullscreenClone';
        
        // Adicionar botão de fechar
        const closeButton = document.createElement('button');
        closeButton.className = 'fullscreen-close';
        closeButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        closeButton.addEventListener('click', () => this.exitFullscreen());
        
        fullscreenOverlay.appendChild(galleryClone);
        fullscreenOverlay.appendChild(closeButton);
        document.body.appendChild(fullscreenOverlay);
        
        // Inicializar eventos na galeria clonada
        this.bindFullscreenEvents(galleryClone);
        
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
    }
    
    exitFullscreen() {
        this.isFullscreen = false;
        
        const fullscreenOverlay = document.getElementById('galleryFullscreen');
        if (fullscreenOverlay) {
            fullscreenOverlay.remove();
        }
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
    }
    
    bindFullscreenEvents(galleryClone) {
        // Navegação
        galleryClone.querySelector('#prevButton').addEventListener('click', () => {
            this.previousImage();
            this.updateFullscreenDisplay(galleryClone);
        });
        galleryClone.querySelector('#nextButton').addEventListener('click', () => {
            this.nextImage();
            this.updateFullscreenDisplay(galleryClone);
        });
        
        // Miniaturas
        const thumbnails = galleryClone.querySelectorAll('.thumbnail-container');
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                this.goToImage(index);
                this.updateFullscreenDisplay(galleryClone);
            });
        });
        
        // Atualizar display na versão fullscreen
        this.updateFullscreenDisplay(galleryClone);
    }
    
    updateFullscreenDisplay(galleryClone) {
        const currentImage = this.images[this.currentIndex];
        
        const mainImage = galleryClone.querySelector('#mainImage');
        const mainCaption = galleryClone.querySelector('#mainCaption');
        const imageCounter = galleryClone.querySelector('#imageCounter');
        
        mainImage.src = currentImage.src;
        mainImage.alt = currentImage.caption || `Imagem ${this.currentIndex + 1}`;
        mainCaption.textContent = currentImage.caption || `Imagem ${this.currentIndex + 1}`;
        imageCounter.textContent = `${this.currentIndex + 1} de ${this.images.length}`;
        
        // Atualizar miniaturas ativas
        const thumbnails = galleryClone.querySelectorAll('.thumbnail-container');
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    preloadImages() {
        // Precarregar próximas 2 imagens
        const preloadIndexes = [
            (this.currentIndex + 1) % this.images.length,
            (this.currentIndex + 2) % this.images.length
        ];
        
        preloadIndexes.forEach(index => {
            const img = new Image();
            img.src = this.images[index].src;
        });
    }
    
    handleResize() {
        // Atualizar scroll das miniaturas se necessário
        this.scrollToActiveThumbnail();
    }
    
    // Métodos públicos para controle externo
    addImage(imageData) {
        this.images.push(imageData);
        this.createThumbnails();
        this.updateDisplay();
    }
    
    removeImage(index) {
        if (index >= 0 && index < this.images.length) {
            this.images.splice(index, 1);
            
            if (this.currentIndex >= this.images.length) {
                this.currentIndex = Math.max(0, this.images.length - 1);
            }
            
            this.createThumbnails();
            this.updateDisplay();
        }
    }
    
    getCurrentImage() {
        return this.images[this.currentIndex];
    }
    
    getTotalImages() {
        return this.images.length;
    }
    
    destroy() {
        // Limpar eventos e elementos
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        
        this.container.innerHTML = '';
        document.removeEventListener('keydown', this.keyboardHandler);
        window.removeEventListener('resize', this.resizeHandler);
    }
}

// Função utilitária para criar galeria rapidamente
function createImageGallery(containerId, images) {
    return new ImageGallery(containerId, images);
}

// Exportar para uso global
window.ImageGallery = ImageGallery;
window.createImageGallery = createImageGallery;

export default ImageGallery;