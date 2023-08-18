import {Timeline} from ".";
const input=document.querySelector('input')
if(input){
    input.addEventListener('input',()=>{
        timeline.progress(Number(input.value))
    })
}
const timeline = new Timeline({
    onUpdate(progress: number) {
        if(input) input.value = String(progress)
    }
})
document.querySelector('.start-btn')?.addEventListener('click',()=>{
    timeline.play()
})
document.querySelector('.pause-btn')?.addEventListener('click',()=>{
    timeline.pause()
})
const rows = [...document.querySelectorAll('.animation-container > p')] as HTMLElement[]
rows.forEach((row,index)=>{
    row.innerHTML = row.innerText.split('').map((letter) => {
        return `<span class="char">${letter}</span>`
    }).join('')
    timeline.fromTo(row.querySelectorAll('.char'),[
        {
            opacity: 0,
            transform: `translateX(${index === 0 ? 0 : 20}px) rotate(${index === 0 ? 0 : 60}deg) scale(3)`,
        },
        {
            opacity: 1,
        }
    ],{
        duration:200,
        delay:-100
    })
    timeline.to(row,{
        opacity: 0,
        transform: `translateY(-300%)`,
    },{
        duration: 1000,
        delay: 1000,
    })
})
