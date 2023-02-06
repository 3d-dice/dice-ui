import './genesysDicePicker.css'
import abilityIcon from "./icons/ability.png"
import boostIcon from "./icons/boost.png"
import challengeIcon from "./icons/challenge.png"
import difficultyIcon from "./icons/difficulty.png"
import proficiencyIcon from "./icons/proficiency.png"
import setbackIcon from "./icons/setback.png"

const noop = () => {}

const defaultNotation = {
  da: {
    count: 0
  },
  db: {
    count: 0
  },
  dc: {
    count: 0
  },
  dd: {
    count: 0
  },
  dp: {
    count: 0
  },
  ds: {
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

class GenesysDicePicker {
  notation = deepCopy(defaultNotation)
  // create Notation Parser
	constructor(options) {
    this.target = options.target ? document.querySelector(options.target) : document.body
		this.elem = this.elem = document.createRange().createContextualFragment(`
      <div class="genesys-dice-picker">
        <form>
          <div class="dice">
            <button value="da"><img class="die" src="${abilityIcon}" alt="da" /></button>
            <button value="db"><img class="die" src="${boostIcon}" alt="db" /></button>
            <button value="dc"><img class="die" src="${challengeIcon}" alt="dc" /></button>
            <button value="dd"><img class="die" src="${difficultyIcon}" alt="dd" /></button>
            <button value="dp"><img class="die" src="${proficiencyIcon}" alt="dp" /></button>
            <button value="ds"><img class="die" src="${setbackIcon}" alt="ds" /></button>
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
      const notation = this.output.innerHTML.split(" + ")
      this.onSubmit(notation)
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
    this.onClear()
  }

  handleResults(results){
		// console.log(`results`, results)
		// const rerolls = this.DRP.handleRerolls(results)
		// if(rerolls.length) {
		// 	this.onReroll(rerolls)
		// 	return rerolls
		// }

		// const finalResults = this.DRP.parsedNotation ? this.DRP.parseFinalResults(results) : results

		// dispatch an event with the results object for other UI elements to listen for
		const event = new CustomEvent('resultsAvailable', {detail: results})
		document.dispatchEvent(event)
		// console.log(`finalResults`, finalResults)

		this.onResults(results)
		
		return results
	}

}

export default GenesysDicePicker