import './advancedRoller.css'
import DiceParser from '@3d-dice/dice-parser-interface'

const noop = () => {}

class AdvancedRoller {
  constructor(options) {
    this.target = options.target ? document.querySelector(options.target) : document.body
    this.elem = document.createRange().createContextualFragment(`
			<div class="adv-roller">
				<form class="adv-roller--form">
					<input class="adv-roller--notation" placeholder="2d20kh1" autocomplete="off" />
					<input class="adv-roller--clear" type="reset" value="Clear" />
				</form>
			</div>
		`)
    this.form = this.elem.querySelector('.adv-roller--form')

    // create Notation Parser - pass on options
    this.DRP = new DiceParser({
      targetRollsCritSuccess: options?.targetRollsCritSuccess || options?.targetRollsCritSuccess || false,
      targetRollsCritFailure: options?.targetRollsCritFailure || options?.targetRollsCrit || false,
      targetRollsCrit: options?.targetRollsCrit || false,
    })

    // callback events
    this.onSubmit = options?.onSubmit || noop
    this.onClear = options?.onClear || noop
    this.onReroll = options?.onReroll || noop
    this.onResults = options?.onResults || noop
    this.init()
  }

  init() {
    this.form.addEventListener('submit', this.submitForm.bind(this))
    this.form.addEventListener('reset', this.clear.bind(this))

    this.target.prepend(this.elem)
  }

  submitForm(e) {
    e.preventDefault()
    this.clear()
    this.onSubmit(this.DRP.parseNotation(this.form.firstElementChild.value))
  }
  clear() {
    this.DRP.clear()
    if (this.onClear) {
      this.onClear()
    }
  }
  handleResults(results) {
    // convert string names back to integers needed by DRP
    // const diceNotation = /[dD]\d+/i
    // results.forEach(result => {
    // 	if(typeof result.sides === "string" && result.sides.match(diceNotation)){
    // 		result.sides = parseInt(result.sides.substring(1))
    // 	}
    // 	result.rolls.forEach(roll => {
    // 		if(typeof roll.sides === "string" && roll.sides.match(diceNotation)){
    // 			roll.sides = parseInt(roll.sides.substring(1))
    // 		}
    // 	})
    // })

    const rerolls = this.DRP.handleRerolls(results);
    if (rerolls.length) {
      this.onReroll(rerolls)
      return rerolls
    }

    const finalResults = this.DRP.parsedNotation ? this.DRP.parseFinalResults(results) : results

    // dispatch an event with the results object for other UI elements to listen for
    const event = new CustomEvent('resultsAvailable', { detail: finalResults })
    document.dispatchEvent(event)

    this.onResults(finalResults)

    return finalResults
  }
}

export default AdvancedRoller
