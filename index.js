import "./style.css";

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';

import gltfUrl from './scene/chair/scene.gltf';
import floorTextureUrl from './scene/wall/textures/sample.jpg';

/*
 * App for arranging furniture in a staticly defined masterplan.
 * 
 * 
 * GENERAL TODOS:
 *  1. Add pop-up for furniture texture and rotation
 *    1.1. Pop-up Done
 *    1.2. Rotation fun
 *    
 *  2. Add div in index.html for calculating price based on furniture selection
 *  3. Find repository of GLTF based furniture models and figure out how to convert  
 *  4. Add menu bar to change texture and scale of object
 *  5. Play around with the GUI
 */

/*
 * Custom global variables
 */

const draggableObjects = new Array();
const wallObjects = new Array();

const mouse = new THREE.Vector2();
const cameraLookAtVector = new THREE.Vector3( 0, 0, 0 );

const modelDirectory = "scene/"

// Speed of changing camera perspective
var cameraSpeed = 1;

// Raycaster object for interacting with objects
var raycaster = new THREE.Raycaster();

/*
 * Scene settings
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

/*
 * Camera settings 
 */
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set( 10, 10, -10 );
camera.lookAt( cameraLookAtVector );

/*
 * Renderer settings
 */
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );


const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set( 20, 20, 20);
scene.add(pointLight);

/*
 * Controls
 * 1. Orbit Controls: Capabilities for panning and zooming
 * 2. Drag Controls: Adds dragging functionality for furniture, has a lot of event listeners
 * 
 * TODO:
 *  1. Check out ways of speeding up drag process along XZ axes.
 */
const orbitControls = new OrbitControls(camera, renderer.domElement);
const dragControls = new DragControls( draggableObjects, camera, renderer.domElement );

dragControls.addEventListener( 'dragstart', function ( event ) {
	//event.object.material.emissive.set( 0xaaaaaa );
  orbitControls.enabled = false;
} );

dragControls.addEventListener( 'drag', function ( event ) {
	//event.object.material.emissive.set( 0xaaaaaa );
  event.object.position.z = 0;
} );

dragControls.addEventListener( 'dragend', function ( event ) {
	//event.object.material.emissive.set( 0x000000 );
  orbitControls.enabled = true;
} );

// dragControls.transformGroup = true;

/*
 * Helper settings
 * 1. Light Helper: Point Light
 * 2. Grid Helper: Doesn't help much 
 * 3. Axes Helper: Good to know which axes goes where, probably going to memorize and remove
 * 
 * TODO:
 *  1. Make draggable, should probably just add to drag control (Take care of which axes you can move it though)
 */

const lightHelper = new THREE.PointLightHelper(pointLight);
scene.add(lightHelper);

// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper( 50 );
scene.add( axesHelper );

/*
 * GUI
 * TODO:
 *  1. Add options for object texture
 *  2. Add price calculator segment
 */

const gui = new GUI();
var objectFolder = gui.addFolder('Object');

/*
 * Events
 * TODO:
 *  1. Add Listener for mouse click and popup for furniture
 */

// Change light location on mouse move
document.addEventListener('mousemove', onMouseMove, false);

// Change camera location on key pressed
document.addEventListener("keydown", onKeyDrop, false);

// Pop-up menu
// TODO: Actually display the popup instead of alert
document.addEventListener("click", onClick, false);

addWalls();

console.log(gltfUrl);
console.log(floorTextureUrl);

addModel(gltfUrl, 1, 10, 0, 0, "chair");
// addModelObj('assets/chairObj/ikea.obj', 0.01, 0, 0, 0);
// addModel('./scene/shelf/SchoolBagShelves.glb', 10, -5,  -7, 45, "shelf");

function animate() {
  requestAnimationFrame( animate );

  renderer.render(scene, camera);``
};

function addModelObj(path, scale, x, y, z, draggable=true) {
  const loader = new OBJLoader();

  loader.load(path, function (obj) {
    scene.add(obj);

    obj.scale.set(scale, scale, scale);
    obj.position.set(x, y, z);

    if (draggable) {
      draggableObjects.push(obj);
    }

    console.log(draggableObjects);
  })
}

function addModel(path, scale, x, y, z, name="", draggable=true) {
  var textureLoader = new THREE.TextureLoader();
  var texture = textureLoader.load( 'scene/chair/textures/Material_baseColor.png' );
  
  texture.flipY = false;
  texture.encoding = THREE.sRGBEncoding
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const loader = new GLTFLoader();

  loader.load( path, function ( gltf ) {
    gltf.scene.name = "Chair";

    scene.add( gltf.scene );

    gltf.scene.scale.set(scale, scale, scale);
    gltf.scene.position.set(x, y, z);

    if (draggable) {
      draggableObjects.push(gltf.scene);
    }

    gltf.scene.traverse( (o) => {
      if ( o.isMesh ) {
        o.name = name;
      }
    })

  }, undefined, function ( error ) {
    
    console.error( error );
    
  } );
}

function createWall(width, height, depth, x, y, z) {
  const geometry = new THREE.BoxGeometry( width, height, depth );

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
  });

  const wall = new THREE.Mesh(geometry, material);
  wall.position.set(x, y, z);

  return wall;
}

function addWalls() {
  var textureLoader = new THREE.TextureLoader();
  var texture = textureLoader.load( floorTextureUrl );
  
  texture.flipY = false;
  texture.encoding = THREE.sRGBEncoding
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 5, 5 );
  texture.anisotropy = 4;

  const wall = createWall(0.5, 15, 100, 25, 0, 0);
  scene.add(wall);
  wallObjects.push(wall);

  const wall1 = createWall(0.5, 15, 100, -25, 0, 0);
  scene.add(wall1);
  wallObjects.push(wall1);

  const wall2 = createWall(0.5, 15, 50, 0, 0, -50);
  wall2.rotation.y = Math.PI / 2;
  scene.add(wall2);
  wallObjects.push(wall2);

  const wall3 = createWall(0.5, 15, 50, 0, 0, 50);
  wall3.rotation.y = Math.PI / 2;
  scene.add(wall3);
  wallObjects.push(wall3);

  const floor = createWall(0.01, 50, 100, 0, -7.5, 0);
  floor.rotation.z = Math.PI / 2;
  scene.add(floor);
  wallObjects.push(floor);

  floor.traverse( (o) => {
    if ( o.isMesh ) {
      o.material.map = texture;
    }
  })
}

function onMouseMove(event) {
  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  // vector.unproject(camera);
  // var dir = vector.sub(camera.position).normalize();
  // var distance = -camera.position.z / dir.z;
  // var pos = camera.position.clone().add(dir.multiplyScalar(distance));

  // pointLight.position.copy(new THREE.Vector3(pos.x, pos.y, pos.z));
}

function onKeyDrop(event) {
  orbitControls.enabled = false;

  var keyCode = event.which;
  console.log(keyCode);
  var arrow = {left: 37, up: 38, right: 39, down: 40 };
  if (event.ctrlKey) {
    if (keyCode == 37) {
      camera.position.z = camera.position.z + cameraSpeed;
      cameraLookAtVector.z = cameraLookAtVector.z + cameraSpeed;
      camera.lookAt( cameraLookAtVector );
    } else if (keyCode == 39) {
      camera.position.z = camera.position.z - cameraSpeed;
      cameraLookAtVector.z = cameraLookAtVector.z - cameraSpeed;
      camera.lookAt( cameraLookAtVector );
    }
  }
  else {
    if (keyCode == 38) {
      camera.position.y = camera.position.y + cameraSpeed;
      cameraLookAtVector.y = cameraLookAtVector.y + cameraSpeed;
      camera.lookAt( cameraLookAtVector );
    } else if (keyCode == 40) {
      camera.position.y = camera.position.y - cameraSpeed;
      cameraLookAtVector.y = cameraLookAtVector.y - cameraSpeed;
      camera.lookAt( cameraLookAtVector );
    } else if (keyCode == 37) {
      camera.position.x = camera.position.x - cameraSpeed;
      cameraLookAtVector.x = cameraLookAtVector.x - cameraSpeed;
      camera.lookAt( cameraLookAtVector );
    } else if (keyCode == 39) {
      camera.position.x = camera.position.x + cameraSpeed;
      cameraLookAtVector.x = cameraLookAtVector.x + cameraSpeed;
      camera.lookAt( cameraLookAtVector );
    } else if (keyCode == 32) {
      camera.position.set(0, 0, 0);
    }
  }

  orbitControls.target = cameraLookAtVector;
  orbitControls.enabled = true;
}

function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(draggableObjects, true);

  if (intersects.length > 0) {
    const selectedObject = intersects[0].object;
    
    // Need to figure out a way to update Dat GUI for the proper item select
    // NOTE: You can get the name and id of the object with obj.name / obj.id
    updateFurnitureMenu(selectedObject);
  }
}

function updateFurnitureMenu(obj) {
  gui.removeFolder(objectFolder);

  const objName = obj.name;
  objectFolder = gui.addFolder(objName);

  var textures = {}

  textures['base'] = "scene/chair/textures/Material_baseColor.png";
  textures['normal'] = "scene/chair/textures/Material_normal.png";
  textures['metallic'] = "scene/chair/textures/Material_metallicRoughness.png";

  var text = {
    texture: 'texture',
  };

  var rotationHandler = objectFolder.add(obj.rotation, 'z', 0, Math.PI * 2);
  var textureHandler = objectFolder.add(text, 'texture', textures);

  textureHandler.onChange(function (value) {
    console.log(value);
    console.log(objName);

    var textureLoader = new THREE.TextureLoader();
    var tex = textureLoader.load( value );

    obj.traverse( (o) => {
      if ( o.isMesh ) {
        // note: for a multi-material mesh, `o.material` may be an array,
        // in which case you'd need to set `.map` on each value.
        o.material.map = tex;
      }
    })
  });

  objectFolder.open();
}