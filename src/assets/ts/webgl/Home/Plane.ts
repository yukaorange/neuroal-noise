import GSAP from 'gsap'

import * as THREE from 'three'

import Assets from '@ts/common/singleton/Assets'
import DebugPane from '@ts/common/singleton/Pane'

import InteractionState from '@ts/common/singleton/InteractionState'
import ScrollAnimator from '@ts/common/singleton/ScrollAnimator'

import vertexShader from '@ts/webgl/shaders/vertex.glsl'
import fragmentShader from '@ts/webgl/shaders/fragment.glsl'

export type TOption = {
  sizes: {
    width: number
    height: number
  }
  device: string
}

export default class Plane {
  private sizes: {
    width: number
    height: number
  }

  private device: string
  private geometry: THREE.PlaneGeometry | null = null
  private material: THREE.ShaderMaterial | null = null
  private mesh: THREE.Mesh | null = null
  private clock = new THREE.Clock()

  private assets = Assets.getInstance()
  private textures: {} | null = null
  private interactionState = InteractionState.getInstance()
  private scrollAnimator = ScrollAnimator.getInstance()
  private pane: DebugPane | null = null

  private scrollPosition = 0

  private rawMousePosition: { x: number; y: number } = { x: 0, y: 0 }
  private normalizedMousePosition: { x: number; y: number } = { x: 0, y: 0 }

  constructor({ sizes, device }: TOption) {
    this.sizes = sizes

    this.device = device

    this.createTexture()

    this.createGeometry()

    this.createMaterial()

    this.createMesh()

    this.createPane()

    this.calculateBounds({
      sizes: this.sizes,
      device: this.device
    })
  }

  private createGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 100, 100)
  }

  private createTexture() {
    this.textures = this.assets.getTextures()
  }

  private createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        // uTexture: { value: this.texture },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        },
        uAspect: { value: window.innerWidth / window.innerHeight },
        uMousePosition: { value: new THREE.Vector2(0, 0) },
        uScroll: { value: 0 },
        uTime: { value: 0 },
        uAlpha: { value: 0 }
      }
    })
  }

  private createMesh() {
    this.mesh = new THREE.Mesh(
      this.geometry as THREE.PlaneGeometry,
      this.material as THREE.ShaderMaterial
    )
  }

  private createPane() {
    this.pane = DebugPane.getInstance()
  }

  public getMesh() {
    return this.mesh as THREE.Mesh
  }

  private calculateBounds(values: TOption) {
    const { sizes, device } = values

    this.sizes = sizes

    this.device = device

    this.updateScale()

    this.updateX()

    this.updateY()
  }

  /**
   * Animations
   */
  public show() {
    GSAP.fromTo(
      (this.mesh?.material as THREE.ShaderMaterial).uniforms.uAlpha,
      {
        value: 0
      },
      {
        value: 1
      }
    )
  }

  public hide() {
    GSAP.to((this.mesh?.material as THREE.ShaderMaterial).uniforms.uAlpha, {
      value: 0
    })
  }
  /**
   * events
   */
  onResize(values: TOption) {
    this.calculateBounds(values)
  }

  /**
   * update
   */

  updateScale() {}

  updateX(x = 0) {
    if (!this.mesh) return

    this.mesh.scale.x = this.sizes.width
  }

  updateY(y = 0) {
    if (!this.mesh) return

    this.mesh.scale.y = this.sizes.height
  }

  update() {
    const elapsedTime = this.clock.getElapsedTime()

    const rawScrollPosition = this.scrollAnimator.getAccumulatedPosition()

    this.scrollPosition = GSAP.utils.clamp(0, 1, rawScrollPosition)

    this.rawMousePosition = this.interactionState.getMousePosition()

    this.normalizedMousePosition = {
      x: this.rawMousePosition.x / window.innerWidth,
      y: 1 - this.rawMousePosition.y / window.innerHeight
    }

    if (this.mesh?.material) {
      const shaderMaterial = this.mesh?.material as THREE.ShaderMaterial

      shaderMaterial.uniforms.uAlpha.value = this.pane?.getParams().alpha

      shaderMaterial.uniforms.uMousePosition.value = new THREE.Vector2(
        this.normalizedMousePosition.x,
        this.normalizedMousePosition.y
      )

      shaderMaterial.uniforms.uScroll.value = this.scrollPosition

      shaderMaterial.uniforms.uTime.value = elapsedTime
    }
  }
}
