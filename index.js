// main.js
import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.125.0/examples/jsm/controls/OrbitControls.js';
import { FirstPersonControls } from 'https://unpkg.com/three@0.125.0/examples/jsm/controls/FirstPersonControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 10, 1000000);
let focusedSphere = null;

let initialCameraDistance;
// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// 添加轨道控制器

// const controlsFirstPerson = new FirstPersonControls(camera, renderer.domElement);
// controlsFirstPerson.lookSpeed = 0.1;
// controlsFirstPerson.movementSpeed = 100;
// controlsFirstPerson.lookVertical = true;
// controlsFirstPerson.activeLook = true;

const controlsOrbit = new OrbitControls(camera, renderer.domElement);
// controlsOrbit.enabled = false;
// controlsOrbit.addEventListener('change', () => {
//   const centroid = new THREE.Vector3();
//   centroid.add(sphere1.position);
//   centroid.add(sphere2.position);
//   centroid.add(sphere3.position);
//   centroid.divideScalar(3);

//   initialCameraDistance = camera.position.distanceTo(centroid);
// });

// 创建球体
const createSphere = (color, mass, x, y, z, vx, vy, vz) => {
  const geometry = new THREE.SphereGeometry(1.5, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(x, y, z);
  sphere.mass = mass;
  sphere.velocity = new THREE.Vector3(vx, vy, vz);
  return sphere;
};



// const randomv = () => 0
const randomv = () => Math.random() * 1 - 0.5;
const sphere1 = createSphere(0xff0000, 1, Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50, randomv(), randomv(), randomv());
// const sphere1 = createSphere(0xff0000, 1, 10, 10, 0, 0, 0, 0);
const sphere2 = createSphere(0x00ff00, 1, Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50, randomv(), randomv(), randomv());
// const sphere2 = createSphere(0x00ff00, 1, -10, 0, 0, 0, 0, 0);
const sphere3 = createSphere(0x0000ff, 1, Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50, randomv(), randomv(), randomv());
// const sphere3 = createSphere(0x0000ff, 1, 10, -10, 0, 0, 0, 0);

scene.add(sphere1, sphere2, sphere3);

// 设置摄像机位置
camera.position.z = 100;

// 运动轨迹效果

const createTrailPoint = (color, position) => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([position.x, position.y, position.z], 3));

  const material = new THREE.PointsMaterial({ color, size: 0.8 });

  return new THREE.Points(geometry, material);
};

const handleCollision = (sphereA, sphereB) => {
  const distance = sphereA.position.distanceTo(sphereB.position);

  if (distance < 3) {
    const tempVelocity = sphereA.velocity.clone();
    sphereA.velocity.copy(sphereB.velocity.multiplyScalar(1.2));
    sphereB.velocity.copy(tempVelocity.multiplyScalar(1.2));
  }
};


// 引力常数
const G = -15;
let isFirstFrame = true, id = 0;
// 动画
const animate = (timestamp) => {
  requestAnimationFrame(animate);

  const time = timestamp * 0.001;

  // 计算球体之间的引力
  const distance12 = sphere1.position.distanceTo(sphere2.position);
  const distance23 = sphere2.position.distanceTo(sphere3.position);
  const distance31 = sphere3.position.distanceTo(sphere1.position);

  let force12 = new THREE.Vector3().subVectors(sphere2.position, sphere1.position)
    .normalize().multiplyScalar(G * sphere1.mass * sphere2.mass / (distance12 * distance12));
  let force23 = new THREE.Vector3().subVectors(sphere3.position, sphere2.position)
    .normalize().multiplyScalar(G * sphere2.mass * sphere3.mass / (distance23 * distance23));
  let force31 = new THREE.Vector3().subVectors(sphere1.position, sphere3.position)
    .normalize().multiplyScalar(G * sphere3.mass * sphere1.mass / (distance31 * distance31));
  handleCollision(sphere1, sphere2);
  handleCollision(sphere2, sphere3);
  handleCollision(sphere1, sphere3);
  // 计算加速度并更新速度和位置
  const acceleration1 = force12.multiplyScalar(-1).clone().add(force31).divideScalar(sphere1.mass);
  const acceleration2 = force12.multiplyScalar(-1).clone().sub(force23).divideScalar(sphere2.mass);
  const acceleration3 = force23.clone().add(force31.multiplyScalar(-1)).divideScalar(sphere3.mass);

  sphere1.velocity.add(acceleration1);
  sphere2.velocity.add(acceleration2);
  sphere3.velocity.add(acceleration3);

  sphere1.position.add(sphere1.velocity);
  sphere2.position.add(sphere2.velocity);
  sphere3.position.add(sphere3.velocity);
  // 计算质心并将场景平移到质心位置
  const centroid = new THREE.Vector3();
  centroid.add(sphere1.position);
  centroid.add(sphere2.position);
  centroid.add(sphere3.position);
  centroid.divideScalar(3);
  controlsOrbit.target.copy(centroid);

  // if (isFirstFrame) {
  //   initialCameraDistance = camera.position.distanceTo(centroid);
  //   isFirstFrame = false;
  // }
  // const direction = new THREE.Vector3().subVectors(camera.position, centroid).normalize();
  // camera.position.copy(centroid).addScaledVector(direction, initialCameraDistance);


  // 更新运动轨迹
  if (++id % 4 == 0) {
    const trailPoint1 = createTrailPoint(0xff0000, sphere1.position);
    const trailPoint2 = createTrailPoint(0x00ff00, sphere2.position);
    const trailPoint3 = createTrailPoint(0x0000ff, sphere3.position);
  
    scene.add(trailPoint1, trailPoint2, trailPoint3);

  }

  if (focusedSphere) {
    camera.position.copy(focusedSphere.position).add(new THREE.Vector3(0, 0, 100));
    camera.lookAt(focusedSphere.position);
  }
  controlsOrbit.update();

  renderer.render(scene, camera);
};

document.addEventListener('keydown', (event) => {
  // ... 其他按键处理逻辑

  if (event.code === 'Space' && 0) {
    if (focusedSphere === null) {
      focusedSphere = sphere1;
      controlsFirstPerson.enabled = false;
      controlsOrbit.enabled = true;
    } else if (focusedSphere === sphere1) {
      focusedSphere = sphere2;
    } else if (focusedSphere === sphere2) {
      focusedSphere = sphere3;
    } else {
      focusedSphere = null;
      controlsFirstPerson.enabled = true;
      controlsOrbit.enabled = false;
    }

    // 设置OrbitControls的焦点和目标
    if (focusedSphere) {
      controlsOrbit.target.copy(focusedSphere.position);
    }
  }
});


animate();
