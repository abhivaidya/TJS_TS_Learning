/// <reference path="../lib/definitions/three/index.d.ts" />
var Engine = (function () {
    function Engine(element, clearColor) {
        this.clock = new THREE.Clock();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(clearColor);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        element.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
    }
    Engine.prototype.enableShadows = function () {
        this.renderer.shadowMap.enabled = true;
    };
    Engine.prototype.setCamera = function (camera) {
        var _this = this;
        this.camera = camera;
        window.addEventListener('resize', function () {
            _this.camera.aspect = window.innerWidth / window.innerHeight;
            _this.camera.updateProjectionMatrix();
            _this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    };
    Engine.prototype.getCamera = function () {
        return this.camera;
    };
    Engine.prototype.addLight = function (light) {
        this.light = light;
        this.scene.add(this.light);
    };
    Engine.prototype.addObject = function (object) {
        this.scene.add(object);
    };
    Engine.prototype.update = function (isPhysicsEnabled) {
        var deltaTime = this.clock.getDelta();
        this.renderer.render(this.scene, this.camera);
        return deltaTime;
    };
    return Engine;
}());
//-------------------------------------------------------------------
var WASDControls = (function () {
    function WASDControls(camera) {
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.enabled = true;
        this.velocity = new THREE.Vector3(1, 1, 1);
        camera.rotation.set(0, 0, 0);
        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(camera);
        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = 10;
        this.yawObject.add(this.pitchObject);
        this.initEventListeners();
    }
    WASDControls.prototype.getObject = function () {
        return this.yawObject;
    };
    WASDControls.prototype.setPitchRotationX = function (x) {
        this.pitchObject.rotation.x = x;
    };
    WASDControls.prototype.initEventListeners = function () {
        var _this = this;
        document.addEventListener('mousemove', function (event) { return _this.onMouseMove(event); }, false);
        document.addEventListener('keydown', function (event) { return _this.setMove(event.keyCode, true); }, false);
        document.addEventListener('keyup', function (event) { return _this.setMove(event.keyCode, false); }, false);
    };
    WASDControls.prototype.onMouseMove = function (event) {
        if (this.enabled === false)
            return;
        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        var factor = 0.002;
        this.yawObject.rotation.y -= movementX * factor;
        this.pitchObject.rotation.x -= movementY * factor;
        this.pitchObject.rotation.x = Math.max(-WASDControls.PI_2, Math.min(WASDControls.PI_2, this.pitchObject.rotation.x));
    };
    ;
    WASDControls.prototype.setMove = function (keyCode, value) {
        if (this.enabled === false)
            return;
        switch (keyCode) {
            case 87:
                this.moveForward = value;
                break;
            case 65:
                this.moveLeft = value;
                break;
            case 83:
                this.moveBackward = value;
                break;
            case 68:
                this.moveRight = value;
                break;
        }
    };
    WASDControls.prototype.update = function (delta) {
        if (this.enabled === false)
            return;
        var factor = 10.0 * delta;
        this.velocity.x -= this.velocity.x * factor;
        this.velocity.y -= this.velocity.y * factor;
        this.velocity.z -= this.velocity.z * factor;
        var step = 400.0 * delta;
        if (this.moveForward)
            this.velocity.z -= step;
        if (this.moveBackward)
            this.velocity.z += step;
        if (this.moveLeft)
            this.velocity.x -= step;
        if (this.moveRight)
            this.velocity.x += step;
        this.yawObject.translateX(this.velocity.x * delta);
        this.yawObject.translateZ(this.velocity.z * delta);
    };
    return WASDControls;
}());
WASDControls.PI_2 = Math.PI / 2;
window.onload = function () {
    var elem = document.getElementById('container');
    elem.innerHTML = "";
    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }
    else {
        var engine_1 = new Engine(elem, 0xBFD1E5);
        engine_1.enableShadows();
        // CAMERA
        {
            var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.2, 1000);
            engine_1.setCamera(camera);
        }
        // DIRECTIONAL LIGHT
        {
            var light = new THREE.DirectionalLight(0xffffff, 1);
            light.castShadow = true;
            light.position.set(50, 100, 50);
            var d = 100;
            light.shadow.camera.left = -d;
            light.shadow.camera.right = d;
            light.shadow.camera.top = d;
            light.shadow.camera.bottom = -d;
            light.shadow.camera.near = 2;
            light.shadow.camera.far = 500;
            light.shadow.mapSize.x = 4096;
            light.shadow.mapSize.y = 4096;
            engine_1.addLight(light);
        }
        // AMBIENT LIGHT
        {
            var ambientLight = new THREE.AmbientLight(0x606060);
            engine_1.addLight(ambientLight);
        }
        // STATS
        var stats_1 = new Stats();
        stats_1.domElement.style.position = 'absolute';
        stats_1.domElement.style.top = '0px';
        elem.appendChild(stats_1.domElement);
        var geometry = new THREE.BoxGeometry(10, 1, 10);
        var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        var cube = new THREE.Mesh(geometry, material);
        engine_1.addObject(cube);
        // CONTROLS
        var controls_1 = new WASDControls(engine_1.getCamera());
        controls_1.getObject().position.set(40, 25, 40);
        controls_1.getObject().rotation.y = 0.75;
        controls_1.setPitchRotationX(-0.25);
        engine_1.addObject(controls_1.getObject());
        /*
                // MOUSE SHOOTER
                const mouseShooter = new MouseShooter(1.2, 10, factory, engine.getCamera());
        */
        // HANDLE MOUSE CLICK
        window.addEventListener('mousedown', function (event) {
            var element = event.target;
            if (element.nodeName == 'A')
                return;
            else if (!controls_1.enabled) {
                //lockPointer(controls);
            }
            else {
                //mouseShooter.shoot();
            }
        }, false);
        // START THE ENGINE
        function animate() {
            requestAnimationFrame(animate);
            var deltaTime = engine_1.update(controls_1.enabled);
            controls_1.update(deltaTime);
            stats_1.update();
        }
        animate();
    }
};
