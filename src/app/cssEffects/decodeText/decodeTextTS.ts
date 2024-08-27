"use client";

/* ------------------------------------------------------------------------ *  
4 states per letter: Transparent | Line | Block | Visible.
These states are shuffled for a unique "decode" effect each time.
* ------------------------------------------------------------------------ */

export function decodeText() {
    const text = document.querySelector('.decode-text') as HTMLElement;
    if (!text) return;
  
    const letters = text.querySelectorAll('.text-animation');
  
    let state = Array(letters.length).fill(0);
    let shuffled = shuffle(Array.from({length: letters.length}, (_, i) => i));
  
    function animate(index: number) {
      let letter = letters[shuffled[index]] as HTMLElement;
      let stateIndex = state[shuffled[index]];
  
      if (stateIndex < 3) {
        letter.classList.remove(`state-${stateIndex}`);
        letter.classList.add(`state-${stateIndex + 1}`);
        state[shuffled[index]]++;
  
        let delay = Math.floor(Math.random() * 150 + 25);
        setTimeout(() => animate(index), delay);
      } else if (index < shuffled.length - 1) {
        animate(index + 1);
      }
    }
  
    animate(0);
  }


// send the node for later .state changes
function firstStages(child: any){
    if( child.classList.contains('state-2') ){   
        child.classList.add('state-3');
    } else if( child.classList.contains('state-1') ){
        child.classList.add('state-2')
    } else if( !child.classList.contains('state-1') ){
        child.classList.add('state-1');
        setTimeout(secondStages.bind(null, child), 100);
    }    
}
function secondStages(child: any){
    if( child.classList.contains('state-1') ){
        child.classList.add('state-2')
        setTimeout(thirdStages.bind(null, child), 100);
    } 
    else if( !child.classList.contains('state-1') )
    {
        child.classList.add('state-1')
    }
}
function thirdStages(child: any){
    if( child.classList.contains('state-2') ){
        child.classList.add('state-3')
    }
}

function shuffle(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }


// Demo only stuff
decodeText();

// beware: refresh button can overlap this timer and cause state mixups
// setInterval(function(){ decodeText(); }, 10000);


