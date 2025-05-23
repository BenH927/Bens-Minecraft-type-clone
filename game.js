// THREE.js Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sky Background
scene.background = new THREE.Color(0x87CEEB); // Blue sky

// Texture Loader
const textureLoader = new THREE.TextureLoader();
const dirtTexture = textureLoader.load("dirt_texture.png");
const stoneTexture = textureLoader.load("stone_texture.png");

// Terrain Generation
const blockSize = 1;
const blocks = [];
const inventory = [0, 0, 0, 0, 0];

function createBlock(x, y, z, type) {
    let texture = type === "dirt" ? dirtTexture : stoneTexture;
    const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, y, z);
    block.userData = { type };
    scene.add(block);
    blocks.push(block);
}

// Generate a flat terrain
for (let x = -5; x < 5; x++) {
    for (let z = -5; z < 5; z++) {
        createBlock(x, 0, z, Math.random() > 0.5 ? "dirt" : "stone");
    }
}

// Player Movement
camera.position.set(0, 2, 5);
let velocityY = 0;

document.addEventListener("keydown", (event) => {
    const speed = 0.3;
    if (event.key === "w") camera.position.z -= speed;
    if (event.key === "s") camera.position.z += speed;
    if (event.key === "a") camera.position.x -= speed;
    if (event.key === "d") camera.position.x += speed;
    if (event.key === " ") velocityY = 0.2; // Jump
});

// Apply Gravity
function applyGravity() {
    camera.position.y += velocityY;
    velocityY -= 0.01;
    if (camera.position.y < 2) velocityY = 0;
}
setInterval(applyGravity, 50);

// Block Breaking (Left-click)
window.addEventListener("click", () => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(blocks);

    if (intersects.length > 0) {
        let block = intersects[0].object;
        let type = block.userData.type;
        scene.remove(block);
        blocks.splice(blocks.indexOf(block), 1);

        // Add to inventory
        for (let i = 0; i < inventory.length; i++) {
            if (inventory[i] < 64) {
                inventory[i]++;
                document.querySelectorAll(".slot")[i].textContent = inventory[i];
                break;
            }
        }
    }
});

// Block Placement (Right-click)
window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(blocks);

    if (intersects.length > 0) {
        let hitBlock = intersects[0].object;
        let position = hitBlock.position.clone();
        position.y += blockSize;

        let blockType = inventory.some(count => count > 0) ? "dirt" : "stone";
        createBlock(position.x, position.y, position.z, blockType);

        // Remove from inventory
        for (let i = 0; i < inventory.length; i++) {
            if (inventory[i] > 0) {
                inventory[i]--;
                document.querySelectorAll(".slot")[i].textContent = inventory[i];
                break;
            }
        }
    }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
