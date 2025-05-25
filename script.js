class DiceClassifier {
    constructor() {
        this.currentDirectory = null;
        this.currentImage = null;
        this.uncategorizedImages = [];
        this.lastAction = null;
        this.selectedDieType = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.selectDirectoryBtn = document.getElementById('selectDirectory');
        this.selectedDirectorySpan = document.getElementById('selectedDirectory');
        this.currentImageElement = document.getElementById('currentImage');
        this.undoButton = document.getElementById('undoButton');
        this.remainingCountElement = document.getElementById('remainingCount');
        this.dieTypeButtons = document.querySelectorAll('.die-type-btn');
        this.classificationOptions = document.querySelector('.classification-options');
        this.numberButtonsContainer = document.querySelector('.number-buttons');
        this.invalidButton = document.querySelector('.invalid-btn');
    }

    attachEventListeners() {
        this.selectDirectoryBtn.addEventListener('click', () => this.selectDirectory());
        this.undoButton.addEventListener('click', () => this.undoLastAction());
        this.dieTypeButtons.forEach(button => {
            button.addEventListener('click', (e) => this.selectDieType(e.target.dataset.sides));
        });
        this.invalidButton.addEventListener('click', () => this.classifyImage('invalid'));
    }

    selectDieType(sides) {
        this.selectedDieType = parseInt(sides);
        this.generateNumberButtons();
        this.classificationOptions.style.display = 'block';
        this.showNextImage();
    }

    generateNumberButtons() {
        this.numberButtonsContainer.innerHTML = '';
        for (let i = 1; i <= this.selectedDieType; i++) {
            const button = document.createElement('button');
            button.className = 'number-btn';
            button.textContent = i;
            button.addEventListener('click', () => this.classifyImage(i.toString()));
            this.numberButtonsContainer.appendChild(button);
        }
    }

    async selectDirectory() {
        try {
            const dirHandle = await window.showDirectoryPicker();
            this.currentDirectory = dirHandle;
            this.selectedDirectorySpan.textContent = dirHandle.name;
            await this.loadUncategorizedImages();
            this.updateUI();
        } catch (error) {
            console.error('Error selecting directory:', error);
            alert('Error selecting directory. Please try again.');
        }
    }

    async loadUncategorizedImages() {
        this.uncategorizedImages = [];
        for await (const entry of this.currentDirectory.values()) {
            if (entry.kind === 'file' && this.isImageFile(entry.name)) {
                this.uncategorizedImages.push(entry);
            }
        }
    }

    isImageFile(filename) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    }

    async showNextImage() {
        if (this.uncategorizedImages.length === 0) {
            this.currentImage = null;
            this.currentImageElement.src = '';
            this.undoButton.disabled = true;
            return;
        }

        this.currentImage = this.uncategorizedImages[0];
        const file = await this.currentImage.getFile();
        this.currentImageElement.src = URL.createObjectURL(file);
        this.undoButton.disabled = false;
    }

    async classifyImage(classification) {
        if (!this.currentImage) return;

        try {
            // Create classification directory if it doesn't exist
            const classificationDir = await this.getOrCreateDirectory(classification);
            
            // Move the file
            const newFileHandle = await classificationDir.getFileHandle(this.currentImage.name, { create: true });
            const writable = await newFileHandle.createWritable();
            const file = await this.currentImage.getFile();
            await writable.write(await file.arrayBuffer());
            await writable.close();

            // Store the action for undo
            this.lastAction = {
                type: 'classify',
                file: this.currentImage,
                classification: classification,
                originalDirectory: this.currentDirectory
            };

            // Remove from uncategorized and show next
            this.uncategorizedImages.shift();
            await this.showNextImage();
            this.updateUI();
        } catch (error) {
            console.error('Error classifying image:', error);
            alert('Error classifying image. Please try again.');
        }
    }

    async undoLastAction() {
        if (!this.lastAction) return;

        try {
            // Move the file back to original directory
            const originalFileHandle = await this.lastAction.originalDirectory.getFileHandle(
                this.lastAction.file.name,
                { create: true }
            );
            const writable = await originalFileHandle.createWritable();
            const file = await this.lastAction.file.getFile();
            await writable.write(await file.arrayBuffer());
            await writable.close();

            // Add back to uncategorized images
            this.uncategorizedImages.unshift(this.lastAction.file);
            this.lastAction = null;
            
            await this.showNextImage();
            this.updateUI();
        } catch (error) {
            console.error('Error undoing last action:', error);
            alert('Error undoing last action. Please try again.');
        }
    }

    async getOrCreateDirectory(name) {
        try {
            return await this.currentDirectory.getDirectoryHandle(name, { create: true });
        } catch (error) {
            console.error('Error creating directory:', error);
            throw error;
        }
    }

    updateUI() {
        this.remainingCountElement.textContent = this.uncategorizedImages.length;
        this.undoButton.disabled = !this.lastAction;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new DiceClassifier();
}); 