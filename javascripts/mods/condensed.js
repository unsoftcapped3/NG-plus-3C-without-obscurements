function loadCondensedData(resetNum=0) { // 1: DimBoost, 2: Galaxy, 3: Infinity, 4: Eternity, 5: Quantum, 6: Ghostify
	if (!player.aarexModifications.ngp3c) return;
	// Load Stuff
	player.aarexModifications.ngp3c = 1;
	if (player.condensed === undefined) {
		player.condensed = {
			normal: [null, 0, 0, 0, 0, 0, 0, 0, 0],
			inf: [null, 0, 0, 0, 0, 0, 0, 0, 0],
		}
	}
	if (player.condensed.inf === undefined) player.condensed.inf = [null, 0, 0, 0, 0, 0, 0, 0, 0]
	
	// Reset Stuff
	if (resetNum>=1) {
		player.condensed.normal = [null, 0, 0, 0, 0, 0, 0, 0, 0]
	}
	if (resetNum>=4) {
		player.condensed.inf = [null, 0, 0, 0, 0, 0, 0, 0, 0]
	}
	
	if (resetNum===Infinity) { // Hard Reset
		save_game();
		window.location.reload();
	}
}

const CONDENSER_START = {
	1: 100,
	2: 1e4,
	3: 1e8,
	4: 1e16,
	5: 1e32,
	6: 1e45,
	7: 1e65,
	8: 1e80,
}

const CONDENSER_BASE = {
	1: 10,
	2: 25,
	3: 100,
	4: 1e4,
	5: 1e8,
	6: 1e10,
	7: 1e15,
	8: 1e20,
}

function getCondenserCostScaling() {
	let s = 1
	if (player.infinityUpgrades.includes("postinfi70")) s *= 0.6
	return s
}

function getCondenserCost(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(1/0);
	let bought = player.condensed.normal[x]
	return Decimal.pow(CONDENSER_BASE[x], Decimal.pow(bought, 1+1.5**getCondenserCostScaling())).times(CONDENSER_START[x])
}

function getCondenserTarget(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(0);
	let res = getOrSubResource(x)
	return Math.floor(Math.pow(res.div(CONDENSER_START[x]).max(1).log10()/Math.log10(CONDENSER_BASE[x]), 1/(1+1.5**getCondenserCostScaling()))+1)
}

function getCondenserPow() {
	let pow = new Decimal(1)
	if (player.galaxies>=2) pow = pow.times((Math.sqrt(player.galaxies*2)*2)/3)
	if (player.infinityUpgrades.includes("postinfi70")) pow = pow.times(getPostInfi70Mult())
	if (player.infinityUpgrades.includes("postinfi72")) pow = pow.times(getPostInfi72Mult())
	if (player.challenges.includes("postc4")) pow = pow.times(1.25)
	return pow
}

function getCondenserEff(x) {
	return Decimal.pow(player.money.plus(1).log10()+1, Decimal.mul(player.condensed.normal[x], getCondenserPow()))
}

function updateCondenser(x) {
	if (!player.aarexModifications.ngp3c) return;
	let costPart = quantumed ? '' : 'Condense: '
	let cost = getCondenserCost(x)
	let resource = getOrSubResource(x)
	document.getElementById("Condense"+x).textContent = costPart + shortenPreInfCosts(cost)
	document.getElementById("Condense"+x).className = resource.gte(cost) ? 'storebtn' : 'unavailablebtn'
}

function condenseDimension(x) {
	if (!player.aarexModifications.ngp3c) return;
	let res = getOrSubResource(x)
	let cost = getCondenserCost(x)
	if (res.lt(cost)) return;
	getOrSubResource(x, cost)
	player.condensed.normal[x]++;
}

function maxCondense(x) {
	if (!player.aarexModifications.ngp3c) return;
	let res = getOrSubResource(x)
	let cost = getCondenserCost(x)
	if (res.lt(cost)) return;
	player.condensed.normal[x] = Math.max(player.condensed.normal[x], getCondenserTarget(x))
	getOrSubResource(x, cost)
}

function updateInfCondenser(x) {
	if (!player.aarexModifications.ngp3c) return;
	let cost = getInfCondenserCost(x)
	let resource = player.infinityPoints
	document.getElementById("infCndCont"+x).style.display = ""
	document.getElementById("infCnd"+x).textContent = (quantumed ? '' : "Condense: ")+shortenPreInfCosts(cost)
	document.getElementById("infCnd"+x).className = resource.gte(cost) ? 'storebtn' : 'unavailablebtn'
}

function getInfCondenserCostDiv() {
	let div = new Decimal(1)
	if (player.infinityUpgrades.includes("postinfi81")) div = div.times(getPostInfi81Mult())
	return div
}

function getInfCondenserCost(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(1/0);
	let bought = player.condensed.inf[x]
	return Decimal.pow(CONDENSER_BASE[x], Decimal.pow(bought, 3.5)).times(Decimal.pow(CONDENSER_START[x], 2.5)).div(getInfCondenserCostDiv())
}

function getInfCondenserTarget(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(0);
	let res = player.infinityPoints
	return Math.floor(Math.pow(res.times(getInfCondenserCostDiv()).div(Decimal.pow(CONDENSER_START[x], 2.5)).max(1).log10()/Math.log10(CONDENSER_BASE[x]), 1/3.5)+1)
}

function getInfCondenserPow() {
	return 1;
}

function getInfCondenserEff(x) {
	return Decimal.pow(player.infinityPower.plus(1).log10()+1, Decimal.mul(player.condensed.inf[x], getInfCondenserPow()))
}

function condenseInfDim(x) {
	if (!player.aarexModifications.ngp3c) return;
	let res = player.infinityPoints
	let cost = getInfCondenserCost(x)
	if (res.lt(cost)) return;
	player.infinityPoints = player.infinityPoints.sub(cost)
	player.condensed.inf[x]++;
}

function maxInfCondense(x) {
	if (!player.aarexModifications.ngp3c) return;
	let res = player.infinityPoints
	let cost = getInfCondenserCost(x)
	if (res.lt(cost)) return;
	player.condensed.inf[x] = Math.max(player.condensed.inf[x], getInfCondenserTarget(x))
	player.infinityPoints = player.infinityPoints.sub(cost)
}

function getPostInfi70Mult() {
	let mult = Decimal.pow(1.02, Math.sqrt(player.resets))
	return mult;
}

function getPostInfi72Mult() {
	let totalInf = player.condensed.inf.reduce((a,c) => (a||0)+(c||0))
	let mult = Math.pow(totalInf, 1.5)/10+1
	return mult;
}

function getPostInfi80Mult() {
	let mult = Decimal.pow(player.infinityPower.plus(1).log10()+1, 2)
	if (player.infinityUpgrades.includes("postinfi82")) mult = mult.pow(Math.cbrt(mult.plus(1).log10()+1))
	return mult;
}

function getPostInfi81Mult() {
	let div = player.infinityPoints.plus(1).pow(.75)
	if (player.infinityUpgrades.includes("postinfi82")) div = div.pow(2.5)
	return div
}

document.getElementById("postinfi70").onclick = function() {
    buyInfinityUpgrade("postinfi70", 1e6);
}

document.getElementById("postinfi71").onclick = function() {
    buyInfinityUpgrade("postinfi71", 5e7);
}

document.getElementById("postinfi72").onclick = function() {
    buyInfinityUpgrade("postinfi72", 1e17);
}

document.getElementById("postinfi80").onclick = function() {
    buyInfinityUpgrade("postinfi80", 1e24);
}

document.getElementById("postinfi81").onclick = function() {
    buyInfinityUpgrade("postinfi81", 1e33);
}

document.getElementById("postinfi82").onclick = function() {
    buyInfinityUpgrade("postinfi82", 1e36);
}