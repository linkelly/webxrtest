import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */


const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

//scene.add(object1, object2, object3)



// Define trunk parameters
const trunkRadius = 0.5;
const trunkHeight = 5;
const trunkSegments = 8;

// Create an array to hold the layers of the trunk
const trunkLayers = [];

// Define the number of layers for the trunk
const numLayers = 5;

// Create each layer of the trunk
for (let i = 0; i < numLayers; i++) {
    let layerHeight, layerRadius;
    if (i === 0) {
        // For the first layer (layer 0), make it thinner and shorter
        layerHeight = trunkHeight / (numLayers); // Decrease the height
        layerRadius = trunkRadius / 2; // Decrease the radius
    } else {
        // For other layers, calculate height and radius based on layer number
        layerHeight = trunkHeight / numLayers; // Calculate the height of each layer
        layerRadius = trunkRadius * (1 - (i / numLayers)); // Decrease the radius for each layer
    }
    const layerMaterial = new THREE.MeshBasicMaterial({ color: i === 0 ? "brown" : "darkgreen" }); // Brown for the first layer, dark green for the rest
    const layerGeometry = new THREE.CylinderGeometry(layerRadius, layerRadius, layerHeight, trunkSegments);
    const layer = new THREE.Mesh(layerGeometry, layerMaterial);
    layer.position.y = (layerHeight * i) - (trunkHeight / 2); // Position each layer accordingly
    trunkLayers.push(layer); // Add the layer to the array
}

const trunkGroup = new THREE.Group();
trunkLayers.forEach(layer => trunkGroup.add(layer) && layer.addEventListener('click', () => {
    // Redirect to Google.com
    console.log('Tree trunk clicked');
    window.location.href = 'https://www.google.com';
})
);

const tree = new THREE.Group();
tree.add(trunkGroup);
tree.position.set(-1.5, 2.5, 0);
scene.add(tree);

// Add click event listener to the tree trunk
trunkGroup.addEventListener('click', () => {
    console.log('Tree trunk clicked');
    window.location.href = 'https://www.google.com';
});



/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        color: 'grey',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
floor.position.y = -0.1
scene.add(floor)

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()
let currentIntersect = null
const rayOrigin = new THREE.Vector3(- 3, 0, 0)
const rayDirection = new THREE.Vector3(10, 0, 0)
rayDirection.normalize()

// raycaster.set(rayOrigin, rayDirection)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const mouse = new THREE.Vector2();
const objLoader = new OBJLoader();
let slug; // Define slug as a global variable

// Load OBJ file
objLoader.load(
    '15910_Great_Grey_Slug_v1.obj',
    (object) => {
        slug = object; // Assign the loaded object to slug
        // Adjust position, rotation, scale as needed
        object.position.set(0, 0, 0);
        object.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
        object.scale.set(0.1, 0.1, 0.1);

        // Create a basic material
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff}); //white

        // Apply the material to the loaded object
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = material;
            }
        });

        // Add loaded object to the scene
        scene.add(object);

        // Render scene
        renderer.render(scene, camera);

        // Add click event listener after the object is loaded
        window.addEventListener('click', (event) => {
            // Calculate mouse coordinates relative to the canvas
            const canvasBounds = canvas.getBoundingClientRect();
            const mouseX = ((event.clientX - canvasBounds.left) / canvas.clientWidth) * 2 - 1;
            const mouseY = -((event.clientY - canvasBounds.top) / canvas.clientHeight) * 2 + 1;

            // Update mouse vector
            mouse.x = mouseX;
            mouse.y = mouseY;

            // Cast a ray from the camera to the mouse position
            raycaster.setFromCamera(mouse, camera);

            // Check for intersections with the slug object
            const intersects = raycaster.intersectObject(slug);

            if (intersects.length > 0) {
                console.log('slug clicked');
                // Change color or perform other actions on the slug object
                const material = new THREE.MeshBasicMaterial({ color: 0xffff00}); //yellow
                slug.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = material;
                    }
                });
                window.open('https://www.ucsc.edu', '_blank');
                event.preventDefault();
            }
        });
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
        console.error('An error occurred while loading the OBJ file:', error);
    }
);





/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.y = 1
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.9)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 2.1)
directionalLight.position.set(1, 2, 3)
scene.add(directionalLight)



// /**
//  * Model
//  */
// const gltfLoader = new GLTFLoader()

// let model = null
// gltfLoader.load(
//     './models/Duck/glTF-Binary/Duck.glb',
//     (gltf) =>
//     {
//         model = gltf.scene
//         model.position.y = - 1.2
//         scene.add(model)
//     }
// )



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Animate objects
    // object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
    // object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
    // object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

    // Cast a fixed ray
    // const rayOrigin = new THREE.Vector3(- 3, 0, 0)
    // const rayDirection = new THREE.Vector3(1, 0, 0)
    // rayDirection.normalize()
    
    // raycaster.set(rayOrigin, rayDirection)
    
    // const objectsToTest = [object1, object2, object3]
    // const intersects = raycaster.intersectObjects(objectsToTest)

    // for(const object of objectsToTest)
    // {
    //     object.material.color.set('#ff0000')
    // }

    // for(const intersect of intersects)
    // {
    //     intersect.object.material.color.set('#0000ff')
    // }

    // Cast a ray from the mouse
    // raycaster.setFromCamera(mouse, camera)
    
    // const objectsToTest = [object1, object2, object3]
    // const intersects = raycaster.intersectObjects(objectsToTest)
    
    // for(const intersect of intersects)
    // {
    //     intersect.object.material.color.set('#0000ff')
    // }

    // for(const object of objectsToTest)
    // {
    //     if(!intersects.find(intersect => intersect.object === object))
    //     {
    //         object.material.color.set('#ff0000')
    //     }
    // }

    // Cast a ray from the mouse and handle events
    raycaster.setFromCamera(mouse, camera)

    //const objectsToTest = [object1, object2, object3]
    const objectsToTest = scene.children
    const intersects = raycaster.intersectObjects(objectsToTest)
    
    if(intersects.length)
    {
        if(!currentIntersect)
        {
            console.log('mouse enter')
        }

        currentIntersect = intersects[0]
    }
    else
    {
        if(currentIntersect)
        {
            console.log('mouse leave')
        }
        
        currentIntersect = null
    }

    // Test intersect with a model
    // if(model)
    // {
    //     const modelIntersects = raycaster.intersectObject(model)
        
    //     if(modelIntersects.length)
    //     {
    //         model.scale.set(1.2, 1.2, 1.2)
    //     }
    //     else
    //     {
    //         model.scale.set(1, 1, 1)
    //     }
    // }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()