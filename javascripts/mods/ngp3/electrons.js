function updateElectronsTab() {
	document.getElementById("normal_galaxies").textContent = getFullExpansion(player.galaxies)
	for (var u = 1; u < 5; u++) document.getElementById("electron_upg_" + u).className = "gluonupgrade " + (canBuyElectronUpg(u) ? "stor" : "unavailabl") + "ebtn"
	if (tmp.ngp3l) {
		document.getElementById("sacrificeGal").className = "gluonupgrade " + ((player.galaxies > tmp.qu.electrons.sacGals && inQC(0)) ? "stor" : "unavailabl") + "ebtn"
		document.getElementById("sacrificeGals").textContent = getFullExpansion(Math.max(player.galaxies-tmp.qu.electrons.sacGals, 0))
		document.getElementById("electronsGain").textContent = getFullExpansion(Math.floor(Math.max(player.galaxies-tmp.qu.electrons.sacGals, 0) * getElectronGainFinalMult()))
	}
	if (!tmp.ngp3l || tmp.qu.autoOptions.sacrifice) updateElectronsEffect()
}

function updateElectrons(retroactive) {
	if (!tmp.ngp3 || !player.masterystudies.includes("d7")) {
		document.getElementById("electronstabbtn").style.display = "none"
		return
	} else document.getElementById("electronstabbtn").style.display = ""
	var mult = getElectronGainFinalMult()
	document.getElementById("electrons_gain_mult" + (tmp.ngp3l ? "_legacy" : "")).textContent = mult.toFixed(2)
	for (var u = 1; u < 5; u++) {
		var cost = getElectronUpgCost(u)
		document.getElementById("electron_upg_" + u).innerHTML = "Increase the multiplier by " + (getElectronGainMult() * getElectronUpgIncrease(u)).toFixed(2) + "x.<br>" +
			"Level: " + getFullExpansion(tmp.qu.electrons.rebuyables[u-1]) + "<br>" +
			"Cost: " + ((u == 4 ? getFullExpansion : shortenCosts)(cost)) + " " + [null, "Time Theorems", "dilated time", "meta-antimatter", "Meta-Dimension Boosts"][u]
	}
	if (retroactive) tmp.qu.electrons.amount = getElectronGainFinalMult() * tmp.qu.electrons.sacGals
	if (tmp.ngp3l && !tmp.qu.autoOptions.sacrifice) updateElectronsEffect()
	if (!tmp.ngp3l) document.getElementById("electrons_percentage").textContent = getGalaxySacrificeMult() * 100
}

function updateElectronsEffect() {
	if (tmp.ngp3l && !tmp.qu.autoOptions.sacrifice) {
		tmp.mpte = getElectronBoostToNDs()
		document.getElementById("electronsAmount2").textContent = "You have " + getFullExpansion(Math.round(tmp.qu.electrons.amount)) + " electrons."
	}
	document.getElementById("sacrificed_gals" + (tmp.ngp3l ? "_legacy" : "")).textContent = getFullExpansion(Math.ceil(tmp.qu.electrons.sacGals))
	document.getElementById("electrons_amount" + (tmp.ngp3l ? "_legacy" : "")).textContent = getFullExpansion(Math.round(tmp.qu.electrons.amount))
	document.getElementById("electronsTranslation").textContent = getFullExpansion(Math.round(tmp.mpte))
	document.getElementById("electronsEffect").textContent = shorten(getDimensionPowerMultiplier("non-random"))
	document.getElementById("linearPerTenMult").textContent = shorten(getDimensionPowerMultiplier("linear"))
	if (!tmp.ngp3l) document.getElementById("elc_to_cqs_effect").textContent = shorten(getElectronBoostToCQs())
}

function sacrificeGalaxy(auto = false) {
	var mult = getGalaxySacrificeMult()
	var amount = (player.galaxies - tmp.qu.electrons.sacGals / mult) * mult
	if (amount < 1 || mult == 0) return
	if (!auto && player.options.sacrificeConfirmation && !confirm("You will perform a galaxy reset, but you will exchange all your galaxies to electrons which will give a boost to multiplier per ten dimensions.")) return
	tmp.qu.electrons.sacGals += amount
	tmp.qu.electrons.amount += getElectronGainFinalMult() * amount
	if (!tmp.qu.autoOptions.sacrifice) updateElectronsEffect()
	if (tmp.ngp3l && !auto) galaxyReset(0)
}

function getGalaxySacrificeMult() {
	return tmp.ngp3l ? 1 : tmp.qu.electrons.percentage || 0
}

function changeGalaxySacrificeMult(x) {
	if (player.options.sacrificeConfirmation && !confirm("This requires a forced quantum reset. Are you sure you want to change?")) return
	tmp.qu.electrons.percentage = x
	quantum(false, true)
}

function normalOrReducedGalaxies() {
	return tmp.ngp3l ? player.galaxies : initialGalaxies()
}

function getElectronBoostPower() {
	var x = tmp.qu.electrons.amount
	if (!tmp.ngp3l) {
		var s = 1e5
		if (player.ghostify.ghostlyPhotons.unl) s += tmp.le[2]
		if (x > s) x = Math.sqrt(x * s)
	}
	return x
}

function getElectronBoostToNDs(mod) {
	if (tmp.ngp3l && !inQC(0)) return 1
	var amount = getElectronBoostPower()
	var s = 149840
	if (!tmp.ngp3l) s = 1/0
	else if (player.ghostify.ghostlyPhotons.unl) s += tmp.le[2]

	if (amount > 37460 + s) amount = Math.sqrt((amount - s) * 37460) + s
	if (tmp.ngp3l && tmp.rg4 && mod != "no-rg4") amount *= 0.7
	if (player.masterystudies !== undefined && player.masterystudies.includes("d13") && mod != "noTree") amount *= getTreeUpgradeEffect(4)
	return amount + 1
}

function getElectronBoostToCQs(mod) {
	var x = getElectronBoostPower()
	var y = 1
	if (player.masterystudies.includes("d11") && tmp.pcc !== undefined && !tmp.ngp3l) y += tmp.pcc.normal / 2
	return Decimal.pow(y / 1e4 + 1, x)
}

function getElectronGainMult() {
	return hasNU(5) ? 3 : 1
}

function getElectronGainFinalMult() {
	var x = tmp.qu.electrons.mult
	if (player.masterystudies.includes("d11") && tmp.pcc !== undefined && !tmp.ngp3l) x += tmp.pcc.normal * 0.1
	x *= getElectronGainMult()
	return x
}

function getElectronUpgCost(u) {
	var amount = tmp.qu.electrons.rebuyables[u-1]
	if (hasBosonicUpg(33)) amount -= tmp.blu[33]
	var base = amount * Math.max(amount - 1, 1) + 1
	var exp = getElectronUpgCostScalingExp(u)
	if (exp != 1) {
		if (base < 0) base = -Math.pow(-base, exp)
		else base = Math.pow(base, exp)
	}
	base += ([null, 82, 153, 638, 26])[u]

	if (u == 1) return Math.pow(10, base)
	if (u == 4) return Math.max(Math.floor(base), 0)
	return Decimal.pow(10, base)
}

function getElectronUpgCostScalingExp(u) {
	if (u == 1) return 1
	return 2
}

function getElectronUpgIncrease(u) {
	return 0.25
}

function buyElectronUpg(u, quick) {
	if (!canBuyElectronUpg(u)) return false
	var cost = getElectronUpgCost(u)
	if (u == 1) player.timestudy.theorem -= cost
	else if (u == 2) player.dilation.dilatedTime = player.dilation.dilatedTime.sub(cost)
	else if (u == 3) player.meta.antimatter = player.meta.antimatter.sub(cost)
	else if (u == 4 && (tmp.ngp3l || player.achievements.includes("ng3p64"))) {
		player.meta.resets -= cost
		player.meta.antimatter = getMetaAntimatterStart()
		clearMetaDimensions()
		for (let i = 2; i <= 8; i++) if (!canBuyMetaDimension(i)) document.getElementById(i + "MetaRow").style.display = "none"
	}
	tmp.qu.electrons.rebuyables[u - 1]++
	if (quick) return true
	tmp.qu.electrons.mult += getElectronUpgIncrease(u)
	updateElectrons(!tmp.ngp3l)
}

function canBuyElectronUpg(id) {
	if (!inQC(0)) return false
	if (id > 3) return player.meta.resets >= getElectronUpgCost(4)
	if (id > 2) return player.meta.antimatter.gte(getElectronUpgCost(3))
	if (id > 1) return player.dilation.dilatedTime.gte(getElectronUpgCost(2))
	return player.timestudy.theorem >= getElectronUpgCost(1)
}
