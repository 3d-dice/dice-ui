import './dicePicker.css'
import DiceParser from '@3d-dice/dice-parser-interface'

import diceIcons from './icons/polyhedral_dice.svg'

const noop = () => {}

const defaultNotation = {
  d4: {
    count: 0
  },
  d6: {
    count: 0
  },
  d8: {
    count: 0
  },
  d10: {
    count: 0
  },
  d12: {
    count: 0
  },
  d20: {
    count: 0
  },
  d100: {
    count: 0
  }
}
function deepCopy(obj){
  return JSON.parse(JSON.stringify(obj))
}

// TODO:
// add modifiers panel
  // Exploding/Penetrating/Compounding
  // Target
  //   Success/Failure
  //     - greater than / less than / equal to
  // Keep/Drop
  //   - highest - number
  //   - lowest - number
  // Advantage/Disadvantage
  // Reroll (once)
  //   - greater than / less than / equal to
  // Sort
  //   - ascending/descending
  // Mod Number
  //   + or - number
// taping on die group shows modifier panel
// future? new group to allow two groups of same dieType

class dicePicker {
  notation = deepCopy(defaultNotation)
  // create Notation Parser
  DRP = new DiceParser()
	constructor(options) {
    this.target = options.target ? document.querySelector(options.target) : document.body
		this.elem = this.elem = document.createRange().createContextualFragment(`
      <div class="dice-picker">
        <form>
          <div class="dice">
            <button value="d4"><img class="die" src="${diceIcons}#d4_die" alt="d4" /></button>
            <button value="d6"><img class="die" src="${diceIcons}#d6_die" alt="d6" /></button>
            <button value="d8"><img class="die" src="${diceIcons}#d8_die" alt="d8" /></button>
            <button value="d10"><img class="die" src="${diceIcons}#d10_die" alt="d10" /></button>
            <button value="d12"><img class="die" src="${diceIcons}#d12_die" alt="d12" /></button>
            <button value="d20"><img class="die" src="${diceIcons}#d20_die" alt="d20" /></button>
            <button value="d100"><img class="die" src="${diceIcons}#d100_die" alt="d100" /></button>
          </div>
          <div class="output">click or tap dice icons to add to roll</div>
          <div class="action">
            <button type="reset">Clear</button>
            <button type="submit">Throw</button>
          </div>
        </form>
      </div>
    `)
    // callback events
		this.onSubmit = options?.onSubmit || noop
		this.onClear = options?.onClear || noop
    this.onReroll = options?.onReroll || noop
		this.onResults = options?.onResults || noop
		this.init()
	}

  init(){
    this.output = this.elem.querySelector('.output')
    const form = this.elem.querySelector('form')
    const buttons = this.elem.querySelectorAll('.dice button')
    buttons.forEach(button => button.addEventListener("click",(e) => {
        e.preventDefault()
        // build notation
        this.notation[button.value].count += 1
        this.updateNotation()
      })
    )
    form.addEventListener('submit',(e)=>{
      e.preventDefault()
      // console.log(`this.output.innerHTML`, this.output.innerHTML)
      this.onSubmit(this.DRP.parseNotation(this.output.innerHTML))
    })
    form.addEventListener('reset',(e)=>{
      e.preventDefault()
      this.updateNotation(true)
    })
    // this.output.addEventListener('click',(e=>{
    //   e.preventDefault()
    //   if(e.target.className == 'grouping'){
    //     console.log("button group clicked => do something")
    //   }
    // }))
    this.target.prepend(this.elem)
  }

  updateNotation(reset){
    let newNotation = ''
    if(reset) {
      this.clear()
      newNotation = 'click or tap dice icons to add to roll'
    } else {
      newNotation = Object.entries(this.notation).reduce((prev,[key, val]) => {
        let joiner = ''
        if(prev !== ''){
          joiner = ' + '
        }
        if (val.count === 0) {
          return prev
        }
        return prev + joiner + val.count + key
      },'')
    }

    this.output.innerHTML = newNotation
  }

  setNotation(notation = {}) {
    this.notation = notation
    this.updateNotation()
  }

  clear(){
    this.notation = deepCopy(defaultNotation)
    this.DRP.clear()
    this.onClear()
  }

  handleResults(results){

    // convert string names back to intigers needed by DRP
    const diceNotation = /[dD]\d+/i
    results.forEach(result => {
      if(typeof result.sides === "string" && result.sides.match(diceNotation)){
        result.sides = parseInt(result.sides.substring(1))
      }
      result.rolls.forEach(roll => {
        if(typeof roll.sides === "string" && roll.sides.match(diceNotation)){
          roll.sides = parseInt(roll.sides.substring(1))
        }
      })
    })

		const rerolls = this.DRP.handleRerolls(results)
		if(rerolls.length) {
			this.onReroll(rerolls)
			return rerolls
		}

		const finalResults = this.DRP.parsedNotation ? this.DRP.parseFinalResults(results) : results

		// dispatch an event with the results object for other UI elements to listen for
		const event = new CustomEvent('resultsAvailable', {detail: finalResults})
		document.dispatchEvent(event)
		// console.log(`finalResults`, finalResults)

		this.onResults(finalResults)
		
		return finalResults
	}

}

export default dicePicker