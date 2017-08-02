/// <reference path="../definitions/index.d.ts" />
var Game = (function () {
    function Game() {
        //this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this._scene = new THREE.Scene(); // create the scene
        // create the camera
        this._camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._renderer = new THREE.WebGLRenderer();
        this._axis = new THREE.AxisHelper(10); // add axis to the scene
        this._light = new THREE.DirectionalLight(0xffffff, 1.0); // add light1
        this._light2 = new THREE.DirectionalLight(0xffffff, 1.0); // add light2
        this._material = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa,
            wireframe: true
        });
        // create a box and add it to the scene
        this._box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), this._material);
    }
    Game.prototype.createScene = function () {
        // set size
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this._renderer.domElement); // add canvas to dom
        this._scene.add(this._axis);
        this._light.position.set(100, 100, 100);
        this._scene.add(this._light);
        this._light2.position.set(-100, 100, -100);
        this._scene.add(this._light2);
        this._scene.add(this._box);
        this._box.position.x = 0.5;
        this._box.rotation.y = 0.5;
        this._camera.position.x = 5;
        this._camera.position.y = 5;
        this._camera.position.z = 5;
        this._camera.lookAt(this._scene.position);
    };
    Game.prototype.animate = function () {
        requestAnimationFrame(this.animate.bind(this));
        this._render();
    };
    Game.prototype._render = function () {
        var timer = 0.002 * Date.now();
        this._box.position.y = 0.5 + 0.5 * Math.sin(timer);
        this._box.rotation.x += 0.1;
        this._renderer.render(this._scene, this._camera);
    };
    return Game;
}());
window.onload = function () {
    var game = new Game();
    game.createScene();
    game.animate();
};
