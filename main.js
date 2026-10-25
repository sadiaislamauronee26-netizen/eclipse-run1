import * as THREE from 'three';

class EclipseRun {
    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.lowPerf = false;
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: !this.isMobile,
            powerPreference: this.isMobile ? 'low-power' : 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x0a001a);
        if (!this.isMobile) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
        
        // Game state
        this.gameRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.distance = 0;
        this.moonShards = 0;
        this.eclipseCrystals = 0;
        this.speed = 0.4;
        this.maxSpeed = 0.8;
        this.baseSpeed = 0.4;
        this.laneWidth = 4;
        this.targetLane = 1;
        this.lanes = [-this.laneWidth, 0, this.laneWidth];
        
        // Player
        this.playerGroup = null;
        this.lyra = null;
        this.lumi = null;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.gravity = -0.018;
        this.isSliding = false;
        this.slideTime = 0;
        
        // Magic abilities
        this.eclipseShiftActive = false;
        this.eclipseShiftTime = 0;
        this.lumiGuidanceActive = false;
        this.lumiGuidanceTime = 0;
        this.crystalDashActive = false;
        this.crystalDashTime = 0;
        this.crystalDashEnergy = 0;
        this.hasShield = false;
        this.hasMagnet = false;
        
        // World
        this.obstacles = [];
        this.collectibles = [];
        this.groundTiles = [];
        this.particles = [];
        this.tileLength = 25;
        this.tilesAhead = 12;
        this.currentZone = 0;
        this.zones = ['MOONLIT RUINS', 'WHISPERING FOREST', 'CRYSTAL ABYSS', 'CELESTIAL FALLS', 'ECLIPSE CITADEL'];
        this.zoneDistance = 0;
        this.nextZoneDistance = 150;
        
        // UI
        this.bestScore = parseInt(localStorage.getItem('eclipseRunBestScore') || '0');
        
        // Touch controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        
        this.setupLights();
        this.setupSky();
        this.setupPlayer();
        this.setupGround();
        this.setupCamera();
        this.setupUI();
        this.setupControls();
        this.setupTouchControls();
        this.animate();
        
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.onWindowResize(), 100);
        });
    }
    
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x4a0e4e, this.isMobile ? 0.8 : 0.6);
        this.scene.add(ambientLight);
        
        // Moonlight
        const moonLight = new THREE.DirectionalLight(0xb0c4de, this.isMobile ? 0.6 : 0.8);
        moonLight.position.set(-20, 30, -10);
        if (!this.isMobile && !this.lowPerf) {
            moonLight.castShadow = true;
            moonLight.shadow.mapSize.width = 1024;
            moonLight.shadow.mapSize.height = 1024;
        }
        this.scene.add(moonLight);
        
        // Magical light
        if (!this.isMobile) {
            const magicLight = new THREE.PointLight(0x00ffff, 2, 30);
            magicLight.position.set(0, 10, 0);
            this.scene.add(magicLight);
            this.magicLight = magicLight;
        }
    }
    
    setupSky() {
        // Create starfield
        const starCount = this.isMobile ? 2000 : 10000;
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: this.isMobile ? 0.3 : 0.5 });
        const starsVertices = [];
        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = Math.random() * 500;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
        
        // Fog
        this.scene.fog = new THREE.Fog(0x0a001a, this.isMobile ? 20 : 30, this.isMobile ? 100 : 150);
    }
    
    setupPlayer() {
        this.playerGroup = new THREE.Group();
        
        // Lyra - body
        const bodyGeometry = new THREE.CylinderGeometry(0.35, 0.45, 1.1, 12);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4b0082,
            emissive: 0x1a0033,
            emissiveIntensity: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.55;
        body.castShadow = true;
        this.lyra = body;
        this.playerGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.32, 12, 12);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xfdbcb4 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.25;
        head.castShadow = true;
        this.playerGroup.add(head);
        
        // Hair
        const hairGeometry = new THREE.SphereGeometry(0.33, 12, 8);
        const hairMaterial = new THREE.MeshPhongMaterial({ color: 0x2d1810 });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.y = 1.3;
        hair.scale.y = 0.7;
        this.playerGroup.add(hair);
        
        // Crystal pendant
        const pendantGeometry = new THREE.OctahedronGeometry(0.08);
        const pendantMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.8
        });
        const pendant = new THREE.Mesh(pendantGeometry, pendantMaterial);
        pendant.position.set(0, 0.8, 0.3);
        this.playerGroup.add(pendant);
        this.pendant = pendant;
        
        // Lumi - companion
        const lumiGeometry = new THREE.SphereGeometry(0.15, 10, 10);
        const lumiMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x87ceeb,
            emissive: 0x87ceeb,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.9
        });
        this.lumi = new THREE.Mesh(lumiGeometry, lumiMaterial);
        this.lumi.position.set(0.6, 1.5, 0.3);
        this.playerGroup.add(this.lumi);
        
        // Lumi glow
        if (!this.isMobile) {
            const lumiGlowGeometry = new THREE.SphereGeometry(0.25, 10, 10);
            const lumiGlowMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x87ceeb,
                transparent: true,
                opacity: 0.3
            });
            const lumiGlow = new THREE.Mesh(lumiGlowGeometry, lumiGlowMaterial);
            this.lumi.add(lumiGlow);
        }
        
        this.playerGroup.position.set(this.lanes[1], 0, 0);
        this.scene.add(this.playerGroup);
    }
    
    setupGround() {
        for (let i = 0; i < this.tilesAhead; i++) {
            this.createGroundTile(i * this.tileLength - 30);
        }
    }
    
    createGroundTile(zPos) {
        const tileGroup = new THREE.Group();
        
        // Main platform
        const groundGeometry = new THREE.PlaneGeometry(this.laneWidth * 3 + 3, this.tileLength);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a0e2e,
            emissive: 0x0a001a,
            emissiveIntensity: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        tileGroup.add(ground);
        
        // Ancient tiles
        const tileCount = this.isMobile ? 3 : 6;
        for (let j = 0; j < tileCount; j++) {
            const tileGeom = new THREE.PlaneGeometry(1.5, 1.5);
            const tileMat = new THREE.MeshPhongMaterial({ 
                color: 0x2d1810,
                emissive: 0x100808,
                emissiveIntensity: 0.3
            });
            const tile = new THREE.Mesh(tileGeom, tileMat);
            tile.rotation.x = -Math.PI / 2;
            tile.position.set(
                (Math.random() - 0.5) * (this.laneWidth * 2),
                0.01,
                (Math.random() - 0.5) * (this.tileLength - 5)
            );
            tileGroup.add(tile);
        }
        
        // Glowing runes
        if (!this.isMobile) {
            for (let i = 0; i < 2; i++) {
                const runeGeom = new THREE.RingGeometry(0.3, 0.5, 8);
                const runeMat = new THREE.MeshBasicMaterial({ 
                    color: 0x00ffff,
                    transparent: true,
                    opacity: 0.6
                });
                const rune = new THREE.Mesh(runeGeom, runeMat);
                rune.rotation.x = -Math.PI / 2;
                rune.position.set((i - 0.5) * this.laneWidth * 1.5, 0.02, 0);
                tileGroup.add(rune);
            }
        }
        
        tileGroup.position.z = zPos;
        this.scene.add(tileGroup);
        this.groundTiles.push(tileGroup);
    }
    
    setupCamera() {
        if (this.isMobile) {
            this.camera.position.set(0, 7, 12);
            this.camera.lookAt(0, 2, -5);
        } else {
            this.camera.position.set(0, 6, 10);
            this.camera.lookAt(0, 2, -5);
        }
    }
    
    setupUI() {
        // Mobile performance toggle
        const perfToggle = document.getElementById('mobilePerfToggle');
        if (perfToggle) {
            perfToggle.addEventListener('change', (e) => {
                this.lowPerf = e.target.checked;
                if (this.lowPerf) {
                    this.renderer.shadowMap.enabled = false;
                }
            });
        }
        
        // Show/hide touch controls
        const touchToggle = document.getElementById('showTouchToggle');
        if (touchToggle) {
            touchToggle.addEventListener('change', (e) => {
                if (e.target.checked && this.isMobile) {
                    document.getElementById('mobileControls').classList.remove('hidden');
                } else {
                    document.getElementById('mobileControls').classList.add('hidden');
                }
            });
        }
        
        // Main menu
        document.getElementById('startGameBtn').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');
            if (this.isMobile) {
                document.getElementById('mobileControls').classList.remove('hidden');
            }
            this.startGame();
        });
        document.getElementById('howToPlayBtn').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.add('hidden');
            document.getElementById('howToPlayScreen').classList.remove('hidden');
        });
        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('mainMenu').classList.add('hidden');
            document.getElementById('settingsScreen').classList.remove('hidden');
        });
        document.getElementById('backFromHowToBtn').addEventListener('click', () => {
            document.getElementById('howToPlayScreen').classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
        });
        document.getElementById('backFromSettingsBtn').addEventListener('click', () => {
            document.getElementById('settingsScreen').classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
        });
        
        // Game over
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        document.getElementById('mainMenuFromOverBtn').addEventListener('click', () => {
            document.getElementById('gameOverScreen').classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
        });
        
        // Pause
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.togglePause();
        });
        document.getElementById('pauseMenuBtn').addEventListener('click', () => {
            document.getElementById('pauseScreen').classList.add('hidden');
            document.getElementById('hud').classList.add('hidden');
            document.getElementById('mobileControls').classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
            this.gameRunning = false;
            this.isPaused = false;
        });
        const mobilePauseBtn = document.getElementById('mobilePauseBtn');
        if (mobilePauseBtn) {
            mobilePauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                if (this.gameRunning && !document.getElementById('gameOverScreen').classList.contains('hidden')) return;
                if (this.gameRunning || this.isPaused) {
                    this.togglePause();
                }
                return;
            }
            
            if (e.code === 'KeyR') {
                if (!document.getElementById('gameOverScreen').classList.contains('hidden')) {
                    this.restartGame();
                }
                return;
            }
            
            if (!this.gameRunning || this.isPaused) return;
            
            switch(e.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight();
                    break;
                case 'Space':
                case 'ArrowUp':
                case 'KeyW':
                    this.jump();
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.slide();
                    break;
            }
        });
    }
    
    setupTouchControls() {
        const gameContainer = document.getElementById('gameContainer');
        
        gameContainer.addEventListener('touchstart', (e) => {
            if (!this.gameRunning || this.isPaused) return;
            if (e.target.classList.contains('touchBtn')) return;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.touchStartTime = Date.now();
            e.preventDefault();
        }, { passive: false });
        
        gameContainer.addEventListener('touchend', (e) => {
            if (!this.gameRunning || this.isPaused) return;
            if (e.target.classList.contains('touchBtn')) return;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            const deltaTime = Date.now() - this.touchStartTime;
            
            if (deltaTime > 300) return;
            
            const minSwipe = 50;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > minSwipe) {
                    this.moveRight();
                } else if (deltaX < -minSwipe) {
                    this.moveLeft();
                }
            } else {
                if (deltaY < -minSwipe) {
                    this.jump();
                } else if (deltaY > minSwipe) {
                    this.slide();
                }
            }
            e.preventDefault();
        }, { passive: false });
        
        // On-screen buttons
        document.getElementById('btnLeft').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameRunning && !this.isPaused) this.moveLeft();
        }, { passive: false });
        
        document.getElementById('btnRight').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameRunning && !this.isPaused) this.moveRight();
        }, { passive: false });
        
        document.getElementById('btnJump').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameRunning && !this.isPaused) this.jump();
        }, { passive: false });
        
        document.getElementById('btnSlide').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameRunning && !this.isPaused) this.slide();
        }, { passive: false });
    }
    
    moveLeft() {
        if (this.targetLane > 0) {
            this.targetLane--;
        }
    }
    
    moveRight() {
        if (this.targetLane < 2) {
            this.targetLane++;
        }
    }
    
    togglePause() {
        if (!this.gameRunning && !this.isPaused) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            document.getElementById('pauseScreen').classList.remove('hidden');
            document.getElementById('mobileControls').classList.add('hidden');
        } else {
            document.getElementById('pauseScreen').classList.add('hidden');
            if (this.isMobile) {
                const touchToggle = document.getElementById('showTouchToggle');
                if (touchToggle && touchToggle.checked) {
                    document.getElementById('mobileControls').classList.remove('hidden');
                }
            }
        }
    }
    
    jump() {
        if (this.isJumping || this.isSliding) return;
        this.isJumping = true;
        this.jumpVelocity = 0.28;
    }
    
    slide() {
        if (this.isJumping || this.isSliding) return;
        this.isSliding = true;
        this.slideTime = 35;
        this.playerGroup.scale.y = 0.5;
        this.playerGroup.position.y = 0.25;
    }
    
    startGame() {
        this.gameRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.distance = 0;
        this.moonShards = 0;
        this.eclipseCrystals = 0;
        this.speed = this.baseSpeed;
        this.currentZone = 0;
        this.zoneDistance = 0;
        this.targetLane = 1;
        this.resetPlayer();
        this.clearWorldObjects();
        if (this.isMobile) {
            const touchToggle = document.getElementById('showTouchToggle');
            if (touchToggle && touchToggle.checked) {
                document.getElementById('mobileControls').classList.remove('hidden');
            }
        }
    }
    
    restartGame() {
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        this.clearWorldObjects();
        this.resetPlayer();
        this.targetLane = 1;
        this.playerGroup.position.set(this.lanes[1], 0, 0);
        this.gameRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.distance = 0;
        this.moonShards = 0;
        this.eclipseCrystals = 0;
        this.speed = this.baseSpeed;
        this.currentZone = 0;
        this.zoneDistance = 0;
        document.getElementById('zoneName').textContent = this.zones[0];
        if (this.isMobile) {
            const touchToggle = document.getElementById('showTouchToggle');
            if (touchToggle && touchToggle.checked) {
                document.getElementById('mobileControls').classList.remove('hidden');
            }
        }
    }
    
    clearWorldObjects() {
        this.obstacles.forEach(obj => this.scene.remove(obj));
        this.collectibles.forEach(obj => this.scene.remove(obj));
        this.obstacles = [];
        this.collectibles = [];
    }
    
    resetPlayer() {
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.isSliding = false;
        this.playerGroup.scale.y = 1;
        this.playerGroup.position.y = 0;
        this.crystalDashActive = false;
        this.hasShield = false;
        this.hasMagnet = false;
        document.getElementById('powerupIndicator').classList.add('hidden');
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('mobileControls').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.remove('hidden');
        
        document.getElementById('finalScore').textContent = Math.floor(this.score);
        document.getElementById('finalDistance').textContent = Math.floor(this.distance);
        document.getElementById('finalMoonShards').textContent = this.moonShards;
        
        if (Math.floor(this.score) > this.bestScore) {
            this.bestScore = Math.floor(this.score);
            localStorage.setItem('eclipseRunBestScore', this.bestScore.toString());
        }
        document.getElementById('bestScore').textContent = this.bestScore;
    }
    
    spawnObstacle(zPos) {
        const types = ['pillar', 'gate', 'barrier'];
        const type = types[Math.floor(Math.random() * types.length)];
        const lane = Math.floor(Math.random() * 3);
        let obstacle;
        
        if (type === 'pillar') {
            const geom = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
            const mat = new THREE.MeshPhongMaterial({ 
                color: 0x4a4a4a,
                emissive: 0x1a1a1a
            });
            obstacle = new THREE.Mesh(geom, mat);
            obstacle.position.set(this.lanes[lane], 1.5, zPos);
        } else if (type === 'gate') {
            const group = new THREE.Group();
            const leftGeom = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 8);
            const rightGeom = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 8);
            const barGeom = new THREE.BoxGeometry(2.5, 0.3, 0.3);
            const mat = new THREE.MeshPhongMaterial({ 
                color: 0x8b4513,
                emissive: 0x2d1810
            });
            const left = new THREE.Mesh(leftGeom, mat);
            const right = new THREE.Mesh(rightGeom, mat);
            const bar = new THREE.Mesh(barGeom, mat);
            left.position.x = -1;
            right.position.x = 1;
            bar.position.y = 1;
            group.add(left, right, bar);
            group.position.set(this.lanes[lane], 1.25, zPos);
            obstacle = group;
        } else {
            const geom = new THREE.BoxGeometry(2.5, 1, 0.5);
            const mat = new THREE.MeshPhongMaterial({ 
                color: 0x800080,
                emissive: 0x4a0e4e,
                emissiveIntensity: 0.4
            });
            obstacle = new THREE.Mesh(geom, mat);
            obstacle.position.set(this.lanes[lane], 0.5, zPos);
        }
        
        obstacle.castShadow = true;
        this.scene.add(obstacle);
        this.obstacles.push(obstacle);
    }
    
    spawnCollectible(zPos) {
        const rand = Math.random();
        let collectible, type;
        
        if (rand < 0.7) {
            // Moon Shard
            const geom = new THREE.OctahedronGeometry(0.35);
            const mat = new THREE.MeshPhongMaterial({ 
                color: 0xc0c0c0,
                emissive: 0x87ceeb,
                emissiveIntensity: 0.5
            });
            collectible = new THREE.Mesh(geom, mat);
            type = 'moon';
        } else if (rand < 0.9) {
            // Eclipse Crystal
            const geom = new THREE.IcosahedronGeometry(0.4);
            const mat = new THREE.MeshPhongMaterial({ 
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 0.7
            });
            collectible = new THREE.Mesh(geom, mat);
            type = 'crystal';
        } else {
            // Power up
            const geom = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
            const mat = new THREE.MeshPhongMaterial({ 
                color: 0xffd700,
                emissive: 0xffd700,
                emissiveIntensity: 0.6
            });
            collectible = new THREE.Mesh(geom, mat);
            type = 'powerup';
        }
        
        const lane = Math.floor(Math.random() * 3);
        collectible.position.set(this.lanes[lane], 1.2, zPos);
        collectible.userData.type = type;
        collectible.castShadow = true;
        this.scene.add(collectible);
        this.collectibles.push(collectible);
    }
    
    checkCollisions() {
        const playerBox = new THREE.Box3().setFromObject(this.playerGroup);
        playerBox.expandByScalar(-0.2);
        
        // Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            const obsBox = new THREE.Box3().setFromObject(obs);
            if (playerBox.intersectsBox(obsBox)) {
                if (this.hasShield) {
                    this.scene.remove(obs);
                    this.obstacles.splice(i, 1);
                    this.hasShield = false;
                    document.getElementById('powerupIndicator').classList.add('hidden');
                    continue;
                }
                if (!this.isJumping && !this.isSliding && !this.crystalDashActive) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // Collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const gem = this.collectibles[i];
            const gemBox = new THREE.Box3().setFromObject(gem);
            if (playerBox.intersectsBox(gemBox) || (this.hasMagnet && gem.position.distanceTo(this.playerGroup.position) < 8)) {
                if (gem.userData.type === 'moon') {
                    this.moonShards++;
                    this.score += 50;
                } else if (gem.userData.type === 'crystal') {
                    this.eclipseCrystals++;
                    this.crystalDashEnergy++;
                    this.score += 150;
                    if (this.crystalDashEnergy >= 3) {
                        this.activateCrystalDash();
                        this.crystalDashEnergy = 0;
                    }
                } else if (gem.userData.type === 'powerup') {
                    this.hasShield = true;
                    document.getElementById('powerupIndicator').textContent = '🛡️ SHIELD ACTIVE';
                    document.getElementById('powerupIndicator').classList.remove('hidden');
                }
                this.scene.remove(gem);
                this.collectibles.splice(i, 1);
            }
        }
    }
    
    activateCrystalDash() {
        this.crystalDashActive = true;
        this.crystalDashTime = 60;
        this.speed = this.maxSpeed * 1.2;
        document.getElementById('powerupIndicator').textContent = '⚡ CRYSTAL DASH';
        document.getElementById('powerupIndicator').classList.remove('hidden');
    }
    
    updatePlayer() {
        // Lane switching
        const targetX = this.lanes[this.targetLane];
        if (Math.abs(this.playerGroup.position.x - targetX) > 0.02) {
            this.playerGroup.position.x += (targetX - this.playerGroup.position.x) * 0.25;
        } else {
            this.playerGroup.position.x = targetX;
        }
        
        // Jumping
        if (this.isJumping) {
            this.playerGroup.position.y += this.jumpVelocity;
            this.jumpVelocity += this.gravity;
            if (this.playerGroup.position.y <= 0) {
                this.playerGroup.position.y = 0;
                this.isJumping = false;
                this.jumpVelocity = 0;
            }
        }
        
        // Sliding
        if (this.isSliding) {
            this.slideTime--;
            if (this.slideTime <= 0) {
                this.isSliding = false;
                this.playerGroup.scale.y = 1;
                this.playerGroup.position.y = 0;
            }
        }
        
        // Lumi animation
        this.lumi.position.y = 1.5 + Math.sin(Date.now() * 0.003) * 0.2;
        this.lumi.rotation.y += 0.05;
        this.pendant.rotation.y += 0.02;
    }
    
    updateWorld() {
        const moveAmount = this.speed;
        
        // Ground tiles
        for (let i = this.groundTiles.length - 1; i >= 0; i--) {
            const tile = this.groundTiles[i];
            tile.position.z += moveAmount;
            if (tile.position.z > 40) {
                tile.position.z = this.groundTiles[0].position.z - this.tileLength;
                this.groundTiles.push(this.groundTiles.splice(i, 1)[0]);
            }
        }
        
        // Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.position.z += moveAmount;
            if (obs.position.z > 20) {
                this.scene.remove(obs);
                this.obstacles.splice(i, 1);
            }
        }
        
        // Collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const gem = this.collectibles[i];
            gem.position.z += moveAmount;
            gem.rotation.y += 0.08;
            gem.rotation.x += 0.05;
            if (gem.position.z > 20) {
                this.scene.remove(gem);
                this.collectibles.splice(i, 1);
            }
        }
        
        // Magic effects
        if (this.crystalDashActive) {
            this.crystalDashTime--;
            if (this.crystalDashTime <= 0) {
                this.crystalDashActive = false;
                this.speed = this.baseSpeed + (this.distance / 1000) * 0.01;
                if (this.speed > this.maxSpeed) this.speed = this.maxSpeed;
                if (!this.hasShield) {
                    document.getElementById('powerupIndicator').classList.add('hidden');
                } else {
                    document.getElementById('powerupIndicator').textContent = '🛡️ SHIELD ACTIVE';
                }
            }
        }
        
        // Spawning
        const spawnRate = this.isMobile ? 0.018 : 0.025;
        const collectRate = this.isMobile ? 0.015 : 0.02;
        if (Math.random() < spawnRate + this.speed * 0.012) {
            this.spawnObstacle(-60 - Math.random() * 40);
        }
        if (Math.random() < collectRate) {
            this.spawnCollectible(-60 - Math.random() * 40);
        }
        
        // Zone transition
        this.zoneDistance += moveAmount * 0.1;
        if (this.zoneDistance >= this.nextZoneDistance && this.currentZone < 4) {
            this.currentZone++;
            this.zoneDistance = 0;
            document.getElementById('zoneName').textContent = this.zones[this.currentZone];
            // Change sky color based on zone
            if (this.currentZone === 1) this.renderer.setClearColor(0x0a1a0a);
            else if (this.currentZone === 2) this.renderer.setClearColor(0x000033);
            else if (this.currentZone === 3) this.renderer.setClearColor(0x1a0a2e);
            else if (this.currentZone === 4) this.renderer.setClearColor(0x2e0a1a);
        }
    }
    
    updateHUD() {
        this.distance += this.speed * 0.12;
        this.score += this.speed * 0.8;
        document.getElementById('score').textContent = Math.floor(this.score);
        document.getElementById('distance').textContent = Math.floor(this.distance);
        document.getElementById('moonShards').textContent = this.moonShards;
        document.getElementById('eclipseCrystals').textContent = this.eclipseCrystals;
        
        // Increase difficulty
        if (this.distance > 50 && !this.crystalDashActive) {
            this.baseSpeed += 0.0003;
            if (this.baseSpeed > this.maxSpeed) this.baseSpeed = this.maxSpeed;
            this.speed = this.baseSpeed;
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.25 : 2));
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.gameRunning && !this.isPaused) {
            this.updatePlayer();
            this.updateWorld();
            this.checkCollisions();
            this.updateHUD();
        }
        
        // Camera follow
        if (this.playerGroup) {
            const camOffset = this.isMobile ? 0.2 : 0.3;
            this.camera.position.x += (this.playerGroup.position.x * camOffset - this.camera.position.x) * 0.1;
            this.camera.lookAt(this.playerGroup.position.x * (this.isMobile ? 0.1 : 0.2), 2, this.playerGroup.position.z - 5);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

new EclipseRun();
