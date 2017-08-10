/// <reference path="../lib/definitions/three/index.d.ts" />

class Engine
{
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private light: THREE.Light;

    private clock: THREE.Clock = new THREE.Clock();

    public constructor(element: HTMLElement, clearColor: number)
    {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(clearColor);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        element.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
    }

    public enableShadows(): void
    {
        this.renderer.shadowMap.enabled = true;
    }

    public setCamera(camera: THREE.PerspectiveCamera): void
    {
        this.camera = camera;
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }

    public getCamera(): THREE.PerspectiveCamera
    {
        return this.camera;
    }

    public addLight(light: THREE.Light): void
    {
        this.light = light;
        this.scene.add(this.light);
    }

    public addObject(object: THREE.Object3D): void
    {
        this.scene.add(object);
    }

    public update(isPhysicsEnabled: boolean): number
    {
		const deltaTime = this.clock.getDelta();
		this.renderer.render(this.scene, this.camera);
		return deltaTime;
	}
}

//-------------------------------------------------------------------

class WASDControls
{
	private pitchObject: THREE.Object3D;
	private yawObject: THREE.Object3D;

	private moveForward = false;
	private moveBackward = false;
	private moveLeft = false;
	private moveRight = false;

	enabled: boolean = true;
	private velocity = new THREE.Vector3(1,1,1);

	private static PI_2 = Math.PI / 2;

	public constructor(camera: THREE.Camera)
    {
		camera.rotation.set(0, 0, 0);
		this.pitchObject = new THREE.Object3D();
		this.pitchObject.add(camera);

		this.yawObject = new THREE.Object3D();
		this.yawObject.position.y = 10;
		this.yawObject.add(this.pitchObject);

		this.initEventListeners();
	}

	public getObject()
    {
		return this.yawObject;
	}

	public setPitchRotationX(x: number): void
    {
		this.pitchObject.rotation.x = x;
	}

	private initEventListeners(): void
    {
		document.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
		document.addEventListener('keydown', (event) => this.setMove(event.keyCode, true), false);
		document.addEventListener('keyup', (event) => this.setMove(event.keyCode, false), false);
	}

	private onMouseMove(event)
    {
		if (this.enabled === false)
            return;

		const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		const factor = 0.002;
		this.yawObject.rotation.y -= movementX * factor;
		this.pitchObject.rotation.x -= movementY * factor;
		this.pitchObject.rotation.x = Math.max(-WASDControls.PI_2, Math.min(WASDControls.PI_2, this.pitchObject.rotation.x));
	};

	private setMove(keyCode:number, value: boolean): void
    {
		if (this.enabled === false)
            return;

        switch (keyCode)
        {
			case 87: // w
				this.moveForward = value;
				break;
			case 65: // a
				this.moveLeft = value;
				break;
			case 83: // s
				this.moveBackward = value;
				break;
			case 68: // d
				this.moveRight = value;
				break;
		}
	}

	public update(delta: number): void
    {
		if (this.enabled === false)
            return;

		const factor = 10.0 * delta;
		this.velocity.x -= this.velocity.x * factor;
		this.velocity.y -= this.velocity.y * factor;
		this.velocity.z -= this.velocity.z * factor;

		const step = 400.0 * delta;
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
	}
}

window.onload = () =>
{
    const elem = document.getElementById('container');
	elem.innerHTML = "";

	if (!Detector.webgl)
    {
		Detector.addGetWebGLMessage();
	}
    else
    {
		const engine = new Engine(elem, 0xBFD1E5);
		engine.enableShadows();

		// CAMERA
		{
			let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.2, 1000);
			engine.setCamera(camera);
		}

		// DIRECTIONAL LIGHT
		{
			let light = new THREE.DirectionalLight(0xffffff, 1);
			light.castShadow = true;
			light.position.set(50, 100, 50);
			const d = 100;
			light.shadow.camera.left = -d;
			light.shadow.camera.right = d;
			light.shadow.camera.top = d;
			light.shadow.camera.bottom = -d;
			light.shadow.camera.near = 2;
			light.shadow.camera.far = 500;
			light.shadow.mapSize.x = 4096;
			light.shadow.mapSize.y = 4096;
			engine.addLight(light);
		}

		// AMBIENT LIGHT
		{
			let ambientLight = new THREE.AmbientLight(0x606060);
			engine.addLight(ambientLight);
		}

		// STATS
		const stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		elem.appendChild(stats.domElement);

        var geometry = new THREE.BoxGeometry( 10, 1, 10 );
        var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        var cube = new THREE.Mesh( geometry, material );
        engine.addObject(cube);


		// CONTROLS
		const controls = new WASDControls(engine.getCamera());
		controls.getObject().position.set(40, 25, 40);
		controls.getObject().rotation.y = 0.75;
		controls.setPitchRotationX(-0.25);
		engine.addObject(controls.getObject());
/*
		// MOUSE SHOOTER
		const mouseShooter = new MouseShooter(1.2, 10, factory, engine.getCamera());
*/
		// HANDLE MOUSE CLICK
		window.addEventListener('mousedown', (event) => {
			let element = <Element> event.target;
			if (element.nodeName == 'A')
				return;
			else if (!controls.enabled)
            {
				//lockPointer(controls);
			}
            else
            {
				//mouseShooter.shoot();
			}
		}, false);

		// START THE ENGINE
		function animate()
        {
			requestAnimationFrame(animate);
			const deltaTime = engine.update(controls.enabled);
			controls.update(deltaTime);
			stats.update();
		}

		animate();
	}
}
