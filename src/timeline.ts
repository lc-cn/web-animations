export class Timeline {
    animations: Animation[] = []
    private delay: number = 0

    constructor(private options: TimeLine.Options = {}) {
    }

    private get lastAnimation(): Animation | undefined {
        return this.animations[this.animations.length - 1]
    }

    private get maxTiming() {
        const timing = this.lastAnimation?.effect?.getTiming()
        if (!timing) return 0
        return (timing?.delay || 0) + Number(timing?.duration || 0)
    }

    play() {
        const callback = () => {
            const onUpdate = this.options.onUpdate || (() => {
            })
            onUpdate(this.progress())
            requestAnimationFrame(callback)
        }
        requestAnimationFrame(callback)
        for (let animation of this.animations) {
            const timing = animation.effect?.getTiming()
            if (!timing) continue
            const animationCost = Number(timing?.delay || 0) + Number(timing?.duration || 0)
            if (animationCost >= this.progress() * this.maxTiming) {
                animation.play()
            }
        }
    }

    pause() {
        for (let animation of this.animations) {
            animation.pause()
        }
    }

    progress(percent: number): void
    progress(): number
    progress(percent?: number) {
        if (percent === void 0) {
            if (!this.lastAnimation) return 0
            return Number(this.lastAnimation.currentTime) / this.maxTiming
        }
        for (let animation of this.animations) {
            animation.currentTime = percent * this.maxTiming
        }
    }

    private getCurrentKeyframe(source: HTMLElement): Keyframe {
        const currentStyle = source.style
        return {
            transform: currentStyle.transform,
            background: currentStyle.background,
            width: currentStyle.width,
            height: currentStyle.height,
            opacity: currentStyle.opacity,
            left: currentStyle.left,
            top: currentStyle.top,
            boxShadow: currentStyle.boxShadow,
            border: currentStyle.border,
            color: currentStyle.color,
            font: currentStyle.font,
        }
    }

    from(source: string | HTMLElement | HTMLElement[]|NodeListOf<HTMLElement>, keyFrame: Keyframe, options: number | KeyframeEffectOptions): this
    from(source: string | HTMLElement | HTMLElement[]|NodeListOf<HTMLElement>, keyFrame: Keyframe): this
    from(source: string | HTMLElement | HTMLElement[]|NodeListOf<HTMLElement>, keyframe: Keyframe, options: number | KeyframeEffectOptions = 0): this {
        if (typeof source === 'string') {
            source = [...document.querySelectorAll(source) as NodeListOf<HTMLElement>]
        }
        if (!source) throw new Error('source is not exist');
        const elements:HTMLElement[] = source instanceof NodeList ? [...source] : Array.isArray(source) ? source : [source]
        elements.forEach((element) => {
            this.add(element, [keyframe, this.getCurrentKeyframe(element)], options)
        })
        return this
    }

    to(source: string | HTMLElement | HTMLElement[]|NodeListOf<HTMLElement>, keyFrame: Keyframe, options: number | KeyframeEffectOptions): this
    to(source: string | HTMLElement | HTMLElement[]|NodeListOf<HTMLElement>, keyFrame: Keyframe): this
    to(source: string | HTMLElement | HTMLElement[]|NodeListOf<HTMLElement>, keyFrame: Keyframe, options: number | KeyframeEffectOptions = 0): this {
        if (typeof source === 'string') {
            source = [...document.querySelectorAll(source) as NodeListOf<HTMLElement>]
        }
        if (!source) throw new Error('source is not exist');
        const elements:HTMLElement[] = source instanceof NodeList ? [...source] : Array.isArray(source) ? source : [source]
        elements.forEach((element) => {
            this.add(element, [this.getCurrentKeyframe(element),keyFrame], options)
        })
        return this
    }

    fromTo(source: string | HTMLElement | HTMLElement[]|NodeListOf<HTMLElement>, keframes: [Keyframe, Keyframe], options: number | KeyframeEffectOptions): this
    fromTo(source: string | HTMLElement | HTMLElement[]|NodeListOf<HTMLElement>, keframes: [Keyframe, Keyframe]): this
    fromTo(source: string | HTMLElement | HTMLElement[]|NodeListOf<HTMLElement>, keframes: [Keyframe, Keyframe], options: number | KeyframeEffectOptions = 0): this {
        if (typeof source === 'string') {
            source = [...document.querySelectorAll(source) as NodeListOf<HTMLElement>]
        }
        if (!source) throw new Error('source is not exist');
        const elements:HTMLElement[] = source instanceof NodeList ? [...source] : Array.isArray(source) ? source : [source]
        elements.forEach((element) => {
            this.add(element, keframes, options)
        })
        return this
    }

    add(source: Element, keframes: [Keyframe, Keyframe], options?: number | KeyframeEffectOptions): this {
        if (typeof options === 'number') options = {duration: options}
        if (!options) options = {duration: 0}
        if (options.delay && options.delay < 0 && !this.animations.length) options.delay = 0
        options={...options}
        options.delay = this.delay + Number(options.delay || 0)
        options.fill = options.fill || 'forwards'

        const animation = new Animation(new KeyframeEffect(source, keframes, options), document.timeline)
        animation.pause()
        this.animations.push(animation)
        if (options) {
            this.delay = (typeof options == "object") ? options.delay + Number(options.duration || 0) : options + this.delay
        }
        return this
    }
}

export namespace TimeLine {
    export interface Options {
        onUpdate?(progress: number): void

        onFinished?(): void
    }
}
