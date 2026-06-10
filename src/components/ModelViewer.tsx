import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Center } from '@react-three/drei'
import { Suspense } from 'react'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

function Model({ url }: { url: string }) {
    const gltf = useLoader(GLTFLoader, url)
    return <primitive object={gltf.scene} scale={2} />
}

export default function ModelViewer({ modelUrl }: { modelUrl: string }) {
    return (
    <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <Suspense fallback={null}>
          <Center>
            <Model url={modelUrl} />
          </Center>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={1.5} enablePan={false} />
        <Environment preset="studio" />
    </Canvas>
    )
}