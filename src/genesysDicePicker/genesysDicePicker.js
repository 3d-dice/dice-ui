import './genesysDicePicker.css'
import abilityIcon from "./icons/ability.png"
import boostIcon from "./icons/boost.png"
import challengeIcon from "./icons/challenge.png"
import difficultyIcon from "./icons/difficulty.png"
import proficiencyIcon from "./icons/proficiency.png"
import setbackIcon from "./icons/setback.png"

const noop = () => {}

const defaultNotation = {
  ability: {
    count: 0
  },
  boost: {
    count: 0
  },
  challenge: {
    count: 0
  },
  difficulty: {
    count: 0
  },
  proficiency: {
    count: 0
  },
  setback: {
    count: 0
  }
}
function deepCopy(obj){
  return JSON.parse(JSON.stringify(obj))
}

class GenesysDicePicker {
  notation = deepCopy(defaultNotation)
  // create Notation Parser
	constructor(options) {
    this.target = options.target ? document.querySelector(options.target) : document.body
		this.elem = this.elem = document.createRange().createContextualFragment(`
      <div class="genesys-dice-picker">
        <form>
          <div class="dice">
            <button value="ability"><img class="die" src="${abilityIcon}" alt="ability" /></button>
            <button value="boost"><img class="die" src="${boostIcon}" alt="boost" /></button>
            <button value="challenge"><img class="die" src="${challengeIcon}" alt="challenge" /></button>
            <button value="difficulty"><img class="die" src="${difficultyIcon}" alt="difficulty" /></button>
            <button value="proficiency"><img class="die" src="${proficiencyIcon}" alt="proficiency" /></button>
            <button value="setback"><img class="die" src="${setbackIcon}" alt="setback" /></button>
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
      const notation = []
      Object.entries(this.notation).forEach(([key,val]) => {
        if(val.count){
          notation.push(val.count + 'd' + key)
        }
      })
      this.onSubmit(notation)
    })
    form.addEventListener('reset',(e)=>{
      e.preventDefault()
      this.updateNotation(true)
    })
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
        return prev + joiner + val.count + ':' + key
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
		// dispatch an event with the results object for other UI elements to listen for
		const event = new CustomEvent('resultsAvailable', {detail: results})
		document.dispatchEvent(event)

		this.onResults(results)
		
		return results
	}

}

export default GenesysDicePicker