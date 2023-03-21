// main.js
import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.125.0/examples/jsm/controls/OrbitControls.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 创建球体
const createSphere = (color, mass, x, y, z, vx, vy, vz) => {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(x, y, z);
  sphere.mass = mass;
  sphere.velocity = new THREE.Vector3(vx, vy, vz);
  return sphere;
};
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
const trailLength = 10000;
const createTrail = (color) => {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(trailLength * 3);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });

  return new THREE.Line(geometry, material);
};

const trail1 = createTrail(0xff0000);
const trail2 = createTrail(0x00ff00);
const trail3 = createTrail(0x0000ff);

scene.add(trail1, trail2, trail3);

// 更新运动轨迹
const updateTrail = (trail, position) => {
  const positions = trail.geometry.attributes.position.array;
  for (let i = 0; i < positions.length - 3; i += 3) {
    positions[i] = positions[i + 3];
    positions[i + 1] = positions[i + 4];
    positions[i + 2] = positions[i + 5];
  }

  positions[positions.length - 3] = position.x;
  positions[positions.length - 2] = position.y;
  positions[positions.length - 1] = position.z;

  trail.geometry.attributes.position.needsUpdate = true;
};

// 引力常数
const G = -10;

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
    if (distance12 < 5) force12 = force12.multiplyScalar(-1);
    if (distance23 < 5) force23 = force23.multiplyScalar(-1);
    if (distance31 < 5) force31 = force31.multiplyScalar(-1);
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

  // 更新运动轨迹
  updateTrail(trail1, sphere1.position);
  updateTrail(trail2, sphere2.position);
  updateTrail(trail3, sphere3.position);

  // 渲染场景
  controls.update();
  renderer.render(scene, camera);
};


// 添加键盘事件监听器
document.addEventListener('keydown', (event) => {
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  const speed = 10;
  switch (event.code) {
    case 'KeyW':
      camera.position.addScaledVector(direction, -speed);
      break;
    case 'KeyA':
      const left = new THREE.Vector3(-direction.z, 0, direction.x);
      camera.position.addScaledVector(left, -speed);
      break;
    case 'KeyS':
      camera.position.addScaledVector(direction, speed);
      break;
    case 'KeyD':
      const right = new THREE.Vector3(direction.z, 0, -direction.x);
      camera.position.addScaledVector(right, -speed);
      break;
  }
});
animate();
