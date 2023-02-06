import './genesysResults.css'
// import advantageIcon from './icons/advantage.svg'
// import despairIcon from './icons/despair.svg'
// import failureIcon from './icons/failure.svg'
// import successIcon from './icons/success.svg'
// import threatIcon from './icons/threat.svg'
// import triumphIcon from './icons/triumph.svg'
import icons from "./icons/icons.svg"
import symbolMap from './genesysSymbolMap.json'

class GenesysResults {
	constructor(selector) {
		this.target = document.querySelector(selector) || document.body
		this.timeout = 500
		this.elem = document.createElement('div');
		this.elem.className = 'genesysResults'
		this.resultsElem1 = document.createElement('div')
		this.resultsElem1.className = 'results hidden'
		this.resultsElem1.style.transition = `all ${this.timeout}ms`
		this.resultsElem2 = document.createElement('div')
		this.resultsElem2.className = 'results hidden'
		this.resultsElem2.style.transition = `all ${this.timeout}ms`
		this.init()
	}

	async init(){
		// console.log("symbolMap", symbolMap)
		this.elem.append(this.resultsElem1)
		this.elem.append(this.resultsElem2)
		this.target.prepend(this.elem)
		this.resultsElem1.addEventListener('click', () => this.clear())
		this.resultsElem2.addEventListener('click', () => this.clear())
		this.even = false
	}

	showResults(data){
		console.log("🚀 ~ showResults ~ data", data)
		
		this.clear(this[`resultsElem${this.even ? 1 : 2}`])
		let rolls = Object.values(this.recursiveSearch(data,'rolls')).map(group => {
			return Object.values(group)
		}).flat()


		let total = data.hasOwnProperty('value') ? data.value : rolls.reduce((val,roll) => val + roll.value,0)
		total = isNaN(total) ? '...' : total
		let resultString = ''
		let totals = {
			"s": 0,
			"a": 0,
			"tr": 0,
			"f": 0,
			"th": 0,
			"d": 0
		}

		rolls.forEach((roll,i) => {
			let val
			let dieType = `d${roll.sides}`
			let face = roll.value.toString()
			let results = symbolMap[dieType][face]
			console.log("🚀 ~ rolls.forEach ~ results", results)

			results.forEach(result => {
				if(result === "") return
				const icon = this.getIcon(result)
				totals[result] += 1
				resultString += `<span class='die-${dieType}'>${icon}</span>`
			})
		})
		console.log("totals", totals)
		const totalResults = document.createRange().createContextualFragment(`
			<div class="totals">
				<span><span><img class="symbol" src="${icons}#success" alt="success icon" /></span><span>:${totals.s}</span></span>
				<span><span><img class="symbol" src="${icons}#advantage" alt="advantage icon" /></span><span>:${totals.a}</span></span>
				<span><span><img class="symbol" src="${icons}#triumph" alt="triumph icon" /></span><span>:${totals.tr}</span></span>
				<span><span><img class="symbol" src="${icons}#failure" alt="failure icon" /></span><span>:${totals.f}</span></span>
				<span><span><img class="symbol" src="${icons}#threat" alt="threat icon" /></span><span>:${totals.th}</span></span>
				<span><span><img class="symbol" src="${icons}#despair" alt="despair icon" /></span><span>:${totals.d}</span></span>
			</div>
		`)
		// resultString += ` = <strong>${total}</strong>`

		const currentElem = this[`resultsElem${this.even ? 2 : 1}`]
		currentElem.innerHTML = resultString
		currentElem.append(totalResults)
		// this.resultsElem.classList.remove('hideEffect')
		clearTimeout(currentElem.hideTimer)
		currentElem.classList.add('showEffect')
		currentElem.classList.remove('hidden')
		currentElem.classList.remove('hideEffect')
		this.even = !this.even

	}
	getIcon(key){
		console.log("🚀 ~ getIcon ~ key", key)
		
		const iconIds = {
			"s": "success",
			"a": "advantage",
			"tr": "triumph",
			"f": "failure",
			"th": "threat",
			"d": "despair"
		}

		return `<img class="symbol" src="${icons}#${iconIds[key]}" alt="${iconIds[key]} icon" />`
	}
	clear(elem){
		const currentElem = elem || this[`resultsElem${this.even ? 1 : 2}`]
		currentElem.classList.replace('showEffect','hideEffect')
		this.even = !this.even
		currentElem.hideTimer = setTimeout(()=>currentElem.classList.replace('hideEffect', 'hidden'),this.timeout)
	}
	// make this static for use by other systems?
	recursiveSearch(obj, searchKey, results = [], callback) {
		const r = results;
		Object.keys(obj).forEach(key => {
			const value = obj[key];
			// if(key === searchKey && typeof value !== 'object'){
			if(key === searchKey){
				r.push(value);
				if(callback && typeof callback === 'function') {
					callback(obj)
				}
			} else if(value && typeof value === 'object'){
				this.recursiveSearch(value, searchKey, r, callback);
			}
		});
		return r;
	}
}

export default GenesysResults