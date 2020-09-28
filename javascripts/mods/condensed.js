function loadCondensedData(resetNum=0) { // 1: DimBoost, 2: Galaxy, 3: Infinity, 4: Eternity, 5: Quantum, 6: Ghostify
	if (!player.aarexModifications.ngp3c) return;
	player.aarexModifications.ngp3c = 1;
	if (player.condensed === undefined) {
		player.condensed = {
			normal: [null, 0, 0, 0, 0, 0, 0, 0, 0],
		}
	}
	if (resetNum>0) {
		player.condensed.normal = [null, 0, 0, 0, 0, 0, 0, 0, 0]
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

function getCondenserCost(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(1/0);
	let bought = player.condensed.normal[x]
	return Decimal.pow(CONDENSER_BASE[x], Decimal.pow(bought, 2.5)).times(CONDENSER_START[x])
}

function getCondenserTarget(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(0);
	let res = getOrSubResource(x)
	return Math.floor(Math.pow(res.div(CONDENSER_START[x]).max(1).log10()/Math.log10(CONDENSER_BASE[x]), 1/2.5)+1)
}

function getCondenserPow() {
	let pow = 1
	if (player.galaxies>=2) pow *= 4/3
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