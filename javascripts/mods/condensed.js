function loadCondensedData(resetNum=0) { // 1: DimBoost, 2: Galaxy, 3: Infinity, 4: Eternity, 5: Quantum, 6: Ghostify
	if (!player.aarexModifications.ngp3c) return;
	// Load Stuff
	let preVer = player.aarexModifications.ngp3c||0
	player.aarexModifications.ngp3c = 1.2;
	if (player.condensed === undefined) {
		player.condensed = {
			normal: [null, 0, 0, 0, 0, 0, 0, 0, 0],
			inf: [null, 0, 0, 0, 0, 0, 0, 0, 0],
			time: [null, 0, 0, 0, 0, 0, 0, 0, 0],
			meta: [null, 0, 0, 0, 0, 0, 0, 0, 0],
			repl: 0,
			obsc: {},
		}
	}
	if (player.condensed.inf === undefined) player.condensed.inf = [null, 0, 0, 0, 0, 0, 0, 0, 0]
	if (player.condensed.repl === undefined) player.condensed.repl = 0
	if (player.condensed.time === undefined) player.condensed.time = [null, 0, 0, 0, 0, 0, 0, 0, 0]
	if (player.condensed.meta === undefined) player.condensed.meta = [null, 0, 0, 0, 0, 0, 0, 0, 0]
	if (player.infchallengeTimes[9] === undefined) {
		player.infchallengeTimes.push(600*60*24*31)
		player.infchallengeTimes.push(600*60*24*31)
	}
	if (player.condensed.obsc === undefined) player.condensed.obsc = {}
	
	// Reset Stuff
	if (resetNum>=1) {
		player.condensed.normal = [null, 0, 0, 0, 0, 0, 0, 0, 0]
	}
	if (resetNum>=4) {
		player.condensed.inf = [null, 0, 0, 0, 0, 0, 0, 0, 0]
		player.condensed.repl = (player.eternities>=50&&resetNum==4)?5:0
	}
	if (resetNum>=5) {
		player.condensed.time = [null, 0, 0, 0, 0, 0, 0, 0, 0]
		player.condensed.meta = [null, 0, 0, 0, 0, 0, 0, 0, 0]
	}
	
	if (preVer<1.1) {
		for (let i=5;i<=8;i++) player["timeDimension"+i].cost = timeDimCost(i, player["timeDimension"+i].bought)
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
	if (player.eternityUpgrades.includes(12)) s *= 2/3
	return s
}

function getCondenserCostDiv() {
	let div = new Decimal(1)
	if (player.timestudy.studies.includes(202)) div = div.times(ts202Eff())
	return div;
}

function getCondenserCost(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(1/0);
	let bought = player.condensed.normal[x]
	return Decimal.pow(CONDENSER_BASE[x], Decimal.pow(bought, 1+1.5**getCondenserCostScaling())).times(CONDENSER_START[x]).div(getCondenserCostDiv())
}

function getCondenserTarget(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(0);
	let res = getOrSubResource(x)
	return Math.floor(Math.pow(res.times(getCondenserCostDiv()).div(CONDENSER_START[x]).max(1).log10()/Math.log10(CONDENSER_BASE[x]), 1/(1+1.5**getCondenserCostScaling()))+1)
}

function getCondenserPow() {
	if (player.currentChallenge == "postcngc_1") return new Decimal(0)
	
	let pow = new Decimal(1)
	if (player.galaxies>=2) pow = pow.times((Math.sqrt(player.galaxies*2)*2)/3)
	if (player.infinityUpgrades.includes("postinfi70")) pow = pow.times(getPostInfi70Mult())
	if (player.infinityUpgrades.includes("postinfi72")) pow = pow.times(getPostInfi72Mult())
	if (player.challenges.includes("postc4")) pow = pow.times(1.25)
	if (player.challenges.includes("postcngc_2")) pow = pow.times(1.15)
	if (player.masterystudies.includes("t267")) pow = pow.times(1.5)
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
	document.getElementById("Condense"+x).className = (resource.gte(cost)&&player[TIER_NAMES[x]+"Bought"]>0) ? 'storebtn' : 'unavailablebtn'
}

function condenseDimension(x) {
	if (!player.aarexModifications.ngp3c) return;
	if (player[TIER_NAMES[x]+"Bought"]<=0) return;
	let res = getOrSubResource(x)
	let cost = getCondenserCost(x)
	if (res.lt(cost)) return;
	getOrSubResource(x, cost)
	player.condensed.normal[x]++;
}

function maxCondense(x) {
	if (!player.aarexModifications.ngp3c) return;
	if (player[TIER_NAMES[x]+"Bought"]<=0) return;
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

function getInfCondenserCostScaling() {
	let scaling = 1
	if (player.eternityUpgrades.includes(12)) scaling *= 2/3
	return scaling;
}

function getInfCondenserCost(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(1/0);
	let bought = player.condensed.inf[x]
	return Decimal.pow(Decimal.pow(CONDENSER_BASE[x], getInfCondenserCostScaling()), Decimal.pow(bought, 3.5)).times(Decimal.pow(CONDENSER_START[x], 2.5)).div(getInfCondenserCostDiv())
}

function getInfCondenserTarget(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(0);
	let res = player.infinityPoints
	return Math.floor(Math.pow(res.times(getInfCondenserCostDiv()).div(Decimal.pow(CONDENSER_START[x], 2.5)).max(1).log10()/Decimal.log10(Decimal.pow(CONDENSER_BASE[x], getInfCondenserCostScaling())), 1/3.5)+1)
}

function getInfCondenserPow() {
	if (player.currentChallenge == "postcngc_1") return 0;
	
	let ret = new Decimal(1)
	if (player.challenges.includes("postcngc_1")) ret = ret.times(tmp.cnd?tmp.cnd.ic9:1)
	if (player.challenges.includes("postcngc_2")) ret = ret.times(1.15)
	if (player.timestudy.studies.includes(13)) ret = ret.times(ts13Eff())
	if (player.dilation.upgrades.includes("ngp3c2")) ret = ret.times(3)
	if (player.masterystudies.includes("t267")) ret = ret.times(1.5)
	return ret;
}

function getExtraInfConds() {
	let cond = 0
	if (player.timestudy.studies.includes(44)) cond+=3
	if (player.dilation.upgrades.includes("ngp3c2")) cond += getDil36Mult()
	return cond
}

function getInfCondenserEff(x) {
	return Decimal.pow(player.infinityPower.plus(1).log10()+1, Decimal.mul(player.condensed.inf[x]+tmp.cnd.extraInf, getInfCondenserPow()))
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
	if (totalInf>=21) totalInf = 20+Math.log10(totalInf)/Math.log10(21)
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

function getReplCondenserCostSuperBase() {
	let base = 2
	if (player.eternityUpgrades.includes(12)) base -= .5
	return base;
}

function getReplCondenseCost() {
	let c = player.condensed.repl
	let cost = Decimal.pow(10, 2+Math.pow(getReplCondenserCostSuperBase(), c))
	return cost;
}

function getReplCondenseTarget() {
	if (player.replicanti.amount.lt(1e3)) return 0;
	let targ = Math.floor(Math.log10(player.replicanti.amount.log10()-2)/Math.log10(getReplCondenserCostSuperBase())+1)
	return targ;
}

function updateReplCond() {
	document.getElementById("replCond").textContent = getFullExpansion(player.condensed.repl)
	document.getElementById("replCond1").textContent = shorten(tmp.cnd?tmp.cnd.repl.eff1:1)
	document.getElementById("replCond2").textContent = shorten(tmp.cnd?tmp.cnd.repl.eff2:1)
	let cost = getReplCondenseCost()
	document.getElementById("replCondenseReq").textContent = shortenCosts(cost)
	document.getElementById("replCondense").className = player.replicanti.amount.gte(cost)?"storebtn":"unavailablebtn"
}

function replCondense(max=false) {
	if (!player.replicanti.unl) return
	if (!player.aarexModifications.ngp3c) return
	let cost = getReplCondenseCost()
	if (player.replicanti.amount.lt(cost)) return;
	if (max) player.condensed.repl = Math.max(player.condensed.repl, getReplCondenseTarget())
	else player.condensed.repl++;
	if (!max) player.replicanti.amount = new Decimal(1)
}

function getReplCondPow() {
	let pow = 1
	if (player.timestudy.studies.includes(21)) pow *= 1.4
	if (player.timestudy.studies.includes(33)) pow *= 1.1
	if (player.timestudy.studies.includes(43)) pow *= ts43Eff()
	if (player.dilation.upgrades.includes(8)) pow *= 1.15
	if (player.masterystudies.includes("t267")) pow *= 1.5
	return pow;
}

function getIC9Eff() {
	let total = player.condensed.normal.reduce((a,c) => (a||0)+(c||0))
	if (total>=25) total = 24+Math.log10(total)/Math.log10(24)
	let mult = Math.log10(total+1)*2+1
	return mult;
}

function updateTimeCondenser(x) {
	if (!player.aarexModifications.ngp3c) return;
	let cost = getTimeCondenserCost(x)
	let resource = player.eternityPoints
	document.getElementById("timeCndCont"+x).style.display = ""
	document.getElementById("timeCnd"+x).textContent = (quantumed ? '' : "Condense: ")+shortenCosts(cost)
	document.getElementById("timeCnd"+x).className = resource.gte(cost) ? 'storebtn' : 'unavailablebtn'
}

function getTimeCondenserCostDiv() {
	let div = new Decimal(1)
	if (player.timestudy.studies.includes(203)) div = div.times(ts203Eff())
	return div
}

function getTimeCondenserCostScaling() {
	let scaling = 1
	if (player.eternityUpgrades.includes(12)) scaling *= 2/3
	return scaling;
}

function getTimeCondenserCost(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(1/0);
	let bought = player.condensed.time[x]
	return Decimal.pow(Decimal.pow(CONDENSER_BASE[x], getTimeCondenserCostScaling()), Decimal.pow(bought, 4)).times(Decimal.div(CONDENSER_START[x], 10)).div(getTimeCondenserCostDiv())
}

function getTimeCondenserTarget(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(0);
	let res = player.eternityPoints
	return Math.floor(Math.pow(res.times(getTimeCondenserCostDiv()).div(Decimal.div(CONDENSER_START[x], 10)).max(1).log10()/Decimal.log10(Decimal.pow(CONDENSER_BASE[x], getTimeCondenserCostScaling())), 1/4)+1)
}

function getTimeCondenserPow() {
	let ret = new Decimal(1)
	if (player.timestudy.studies.includes(195)) ret = ret.times(50)
	if (player.dilation.upgrades.includes("ngp3c1")) ret = ret.times(getDil26Mult())
	if (player.masterystudies.includes("t267")) ret = ret.times(1.5)
	return ret;
}

function getFreeTimeConds() {
	let cond = 0
	if (player.dilation.upgrades.includes("ngp3c2")) cond += getDil36Mult()
	if (player.dilation.upgrades.includes("ngpp4")) cond++;
	return cond;
}

function getTimeCondenserEff(x) {
	return Decimal.pow(player.timeShards.plus(1).log10()+1, Decimal.mul(player.condensed.time[x]+getFreeTimeConds(), getTimeCondenserPow()))
}

function condenseTimeDim(x) {
	if (!player.aarexModifications.ngp3c) return;
	let res = player.eternityPoints
	let cost = getTimeCondenserCost(x)
	if (res.lt(cost)) return;
	player.eternityPoints = player.eternityPoints.sub(cost)
	player.condensed.time[x]++;
}

function maxTimeCondense(x) {
	if (!player.aarexModifications.ngp3c) return;
	let res = player.eternityPoints
	let cost = getTimeCondenserCost(x)
	if (res.lt(cost)) return;
	player.condensed.time[x] = Math.max(player.condensed.time[x], getTimeCondenserTarget(x))
	player.eternityPoints = player.eternityPoints.sub(cost)
}

function ts13Eff() {
	let eff = Math.pow(player.galaxies+1, 4/9);
	return eff;
}

function ts25Eff() {
	let eff = Decimal.pow(player.infinityPower.plus(1).log10()+1, 10);
	if (player.timestudy.studies.includes(197)) eff = eff.pow(3)
	if (player.dilation.upgrades.includes("ngp3c3")) eff = eff.pow(getDil46Mult())
	return eff;
}

function ts35Eff() {
	let ip = player.infinityPoints;
	let reached = false;
	if (ip.gte("1e9000")) reached = true;
	ip = ip.div("1e9500")
	let eff = Decimal.pow(ip.plus(1).log10()/100+1, 4).max(10)
	if (reached && ip.lt(1)) eff = new Decimal(10)
	return eff;
}

function ts43Eff() {
	let eff = player.replicanti.galaxies*0.02
	if (player.timestudy.studies.includes(197)) eff *= 3
	return eff+1
}

function ts52Eff() {
	let eff = Math.sqrt(player.replicanti.galaxies/2)
	if (player.timestudy.studies.includes(172)) eff *= Math.cbrt(player.replicanti.galaxies/10+1)
	return eff+1;
}

function ts63Eff() {
	let eff = Decimal.pow(player.eternityPoints.plus(1), 100)
	if (eff.gte("1e1000")) eff = Decimal.pow(eff.log10(), 1000/3)
	return eff;
}

function ts152Eff() {
	let eff = Decimal.pow(10, Math.sqrt(player.galaxies*5))
	return eff;
}

function ts172Eff() {
	let repl = player.replicanti.amount
	if (player.timestudy.studies.includes(197)) repl = repl.pow(Math.sqrt(player.replicanti.galaxies/2.5+1))
	else if (repl.gte("1e4000")) repl = Decimal.pow(repl.log10(), 1110.49).min(repl);
	let eff = repl.plus(1).pow(1e-3);
	if (eff.gte(1e285)) eff = new Decimal(eff.log10()).times(Decimal.div(1e285, 285))
	return eff;
}

function ts191Eff() {
	let inf = getInfinitied()
	let eff = Decimal.add(inf, 1).log10()/5
	return eff;
}

function ts202Eff() {
	let cond = player.condensed.normal.reduce((a,c) => (a||0)+(c||0));
	let eff = Decimal.pow("1e25000", Math.sqrt(cond))
	return eff;
}

function ts203Eff() {
	let cond = player.condensed.time.reduce((a,c) => (a||0)+(c||0));
	let eff = Decimal.pow(1e50, Math.sqrt(cond))
	return eff;
}

const OBSCUREMENTS = {
	nd: {
		title: "Normal Dimension Multipliers",
		scID: "NDs",
		osID: "ND",
		res() { return getDimensionFinalMultiplier(1) },
	},
	ts: {
		title: "Tickspeed",
		scID: "TS",
		osID: "TS",
		res() { return getTickspeed().pow(-1) },
	},
	sac: {
		title: "Sacrifice Multiplier",
		scID: "SAC",
		osID: "SAC",
		res() { return calcTotalSacrificeBoost() },
	},
	ip: {
		title: "IP Gain",
		scID: "IP",
		osID: "IP",
		res() { return gainedInfinityPoints() },
	},
	id: {
		title: "Infinity Dimension Multipliers",
		scID: "IDs",
		osID: "ID",
		res() { return DimensionPower(1) },
	},
	ep: {
		title: "EP Gain",
		scID: "EP",
		osID: "EP",
		res() { return gainedEternityPoints() },
	},
	td: {
		title: "Time Dimension Multipliers",
		scID: "TDs",
		osID: "TD",
		res() { return getTimeDimensionPower(1) },
	},
	dt: {
		title: "Dilated Time Gain",
		scID: "DT",
		osID: "DT",
		res() { return getDilTimeGainPerSecond() },
	},
	tp: {
		title: "Tachyon Particle Gain",
		scID: "TP",
		osID: "TP",
		res() { return player.dilation.totalTachyonParticles },
	},
}

function updateObscurements() {
	let html = ""
	for (let i=0;i<Object.keys(OBSCUREMENTS).length;i++) {
		let data = OBSCUREMENTS[Object.keys(OBSCUREMENTS)[i]]
		let scData = Object.values(softcap_data["ngp3c"+data.scID])
		let res = new Decimal(data.res())
		if (!player.condensed.obsc[data.osID]) {
			if (res.gte((typeof scData[0].start == "function") ? scData[0].start() : scData[0].start) && (data.unl?data.unl():true)) player.condensed.obsc[data.osID] = []
			else continue;
		}
		html += "<h3>"+data.title+"</h3><br><ul style='list-style-type: none;'>"
		for (let j=0;j<scData.length;j++) {
			let newData = scData[j]
			let start = (typeof newData.start == "function") ? newData.start() : newData.start
			if (!player.condensed.obsc[data.osID].includes(j+1)) {
				if (res.gte(start)) player.condensed.obsc[data.osID].push(j+1)
				else continue;
			}
			html += "<li>OS_"+data.osID+"_"+(j+1)+": Starts at "+shorten(start)
			if (newData.func=="pow") html += ", ^"+shorten((typeof newData.pow == "function") ? newData.pow() : newData.pow)
			html += "</li>"
		}
		html += "</ul><br><br>"
	}
	if (html=="") html+="Oh hey there's nothing here yet... you need to make more progress first, so check in later!"
	document.getElementById("obscurements").innerHTML = html;
}

function getDil26Mult() {
	let mult = Math.pow(10, Math.pow(Math.log10(player.dilation.tachyonParticles.plus(1).log10()/5+1)+1, 1/4)-1)
	return mult;
}

function getDil36Mult() {
	let mult = Math.pow(player.dilation.dilatedTime.plus(1).log10()+1, 1/5)*5
	return mult;
}

function getDil46Mult() {
	let mult = Math.pow(Math.log10(player.dilation.dilatedTime.plus(1).log10()+1)+1, 2);
	return mult;
}

function getDil56Mult() {
	let mult = Decimal.pow(10, Math.sqrt(player.meta.antimatter.plus(1).log10())*1e4)
	return mult;
}

function getDil83Mult() {
	let mult = Decimal.pow(player.eternityPoints.plus(1).log10()+1, 0.75);
	return mult;
}

function getDil85Mult() {
	let tp = player.dilation.tachyonParticles
	if (tp.gte(Number.MAX_VALUE)) tp = tp.sqrt().times(Decimal.sqrt(Number.MAX_VALUE))
	let mult = Math.pow(tp.plus(1).log10()+1, 0.165)
	return mult;
}

function updateMetaCondenser(x) {
	if (!player.aarexModifications.ngp3c) return;
	let cost = getMetaCondenserCost(x)
	let resource = player.meta.antimatter
	document.getElementById("metaCndCont"+x).style.display = ""
	document.getElementById("metaCnd"+x).textContent = (quantumed ? '' : "Condense: ")+shortenCosts(cost)
	document.getElementById("metaCnd"+x).className = resource.gte(cost) ? 'storebtn' : 'unavailablebtn'
}

function getMetaCondenserCostDiv() {
	let div = new Decimal(1)
	return div
}

function getMetaCondenserCostScaling() {
	let scaling = 1
	return scaling;
}

function getMetaCondenserCost(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(1/0);
	let bought = player.condensed.meta[x]
	return Decimal.pow(Decimal.pow(CONDENSER_BASE[x], getMetaCondenserCostScaling()), Decimal.pow(bought, 4)).times(CONDENSER_START[x]).div(getMetaCondenserCostDiv())
}

function getMetaCondenserTarget(x) {
	if (!player.aarexModifications.ngp3c) return new Decimal(0);
	let res = player.meta.antimatter
	return Math.floor(Math.pow(res.times(getMetaCondenserCostDiv()).div(CONDENSER_START[x]).max(1).log10()/Decimal.log10(Decimal.pow(CONDENSER_BASE[x], getMetaCondenserCostScaling())), 1/4)+1)
}

function getMetaCondenserPow() {
	let ret = new Decimal(1)
	if (player.masterystudies.includes("t267")) ret = ret.times(1.5)
	ret = ret.times(getECReward(14, true))
	return ret;
}

function getFreeMetaConds() {
	let cond = 0
	if (player.dilation.upgrades.includes("ngpp4")) cond++;
	return cond;
}

function getMetaCondenserEff(x) {
	return Decimal.pow(player.meta.antimatter.plus(1).log10()+1, Decimal.mul(player.condensed.meta[x]+getFreeMetaConds(), getMetaCondenserPow()))
}

function condenseMetaDim(x) {
	if (!player.aarexModifications.ngp3c) return;
	if (player.meta[x].bought<=0) return;
	let res = player.meta.antimatter
	let cost = getMetaCondenserCost(x)
	if (res.lt(cost)) return;
	player.meta.antimatter = player.meta.antimatter.sub(cost)
	player.condensed.meta[x]++;
}

function maxMetaCondense(x) {
	if (!player.aarexModifications.ngp3c) return;
	if (player.meta[x].bought<=0) return;
	let res = player.meta.antimatter
	let cost = getMetaCondenserCost(x)
	if (res.lt(cost)) return;
	player.condensed.meta[x] = Math.max(player.condensed.meta[x], getMetaCondenserTarget(x))
	player.meta.antimatter = player.meta.antimatter.sub(cost)
}

function isIC10Trapped() {
	return player.currentEternityChall == "eterc13" && player.aarexModifications.ngp3c
}