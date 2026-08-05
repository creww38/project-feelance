/* ── LIVE CLOCK ── */
const clock = document.getElementById("clock");
function tick() {
	const d = new Date();
	clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
		.map((n) => String(n).padStart(2, "0"))
		.join(":");
}
tick();
setInterval(tick, 1000);

/* ── LIVE SYSTEM STATS ── */
const cpuEl = document.getElementById("cpu");
const memEl = document.getElementById("mem");
const liveReaders = document.getElementById("live-readers");

setInterval(() => {
	cpuEl.textContent =
		String(Math.floor(2 + Math.random() * 15)).padStart(2, "0") + "%";
	memEl.textContent =
		String(Math.floor(55 + Math.random() * 15)).padStart(2, "0") + "%";
	if (liveReaders) {
		const n = 700 + Math.floor(Math.random() * 400);
		liveReaders.textContent = n.toLocaleString();
	}
}, 2400);

/* ── SPARKLINE ── */
const sparkLine = document.getElementById("spark-line");
const sparkFill = document.getElementById("spark-fill");
function drawSpark() {
	const pts = [];
	for (let x = 0; x <= 200; x += 8) {
		const y =
			30 +
			Math.sin(x * 0.04 + Date.now() * 0.0008) * 14 +
			(Math.random() - 0.5) * 6;
		pts.push(`${x},${y.toFixed(1)}`);
	}
	sparkLine.setAttribute("points", pts.join(" "));
	sparkFill.setAttribute("points", `0,60 ${pts.join(" ")} 200,60`);
}
drawSpark();
setInterval(drawSpark, 1800);

/* ── FILTERS ── */
const filterEls = document.querySelectorAll("#filters li");
const cards = document.querySelectorAll(".card");

filterEls.forEach((el) => {
	el.addEventListener("click", () => {
		filterEls.forEach((e) => e.classList.remove("active"));
		el.classList.add("active");
		const f = el.dataset.filter;
		cards.forEach((c) => {
			c.classList.toggle("hidden", f !== "all" && c.dataset.cat !== f);
		});
		focusedIdx = 0;
		updateFocus();
	});
});

/* ── SORT ── */
const sortEls = document.querySelectorAll("#sorts li");
const feed = document.getElementById("feed");

sortEls.forEach((el) => {
	el.addEventListener("click", () => {
		sortEls.forEach((e) => e.classList.remove("active"));
		el.classList.add("active");
		const s = el.dataset.sort;
		const arr = Array.from(cards);
		arr.sort((a, b) => {
			if (s === "date") return arr.indexOf(a) - arr.indexOf(b);
			if (s === "rating")
				return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
			if (s === "reads")
				return parseInt(b.dataset.reads) - parseInt(a.dataset.reads);
			if (s === "time") return parseInt(a.dataset.time) - parseInt(b.dataset.time);
		});
		arr.forEach((c) => feed.appendChild(c));
	});
});

/* ── KEYBOARD NAVIGATION ── */
let focusedIdx = 0;
const cmd = document.getElementById("cmd");

function visibleCards() {
	return Array.from(cards).filter((c) => !c.classList.contains("hidden"));
}

function updateFocus() {
	const vis = visibleCards();
	cards.forEach((c) => c.classList.remove("focused"));
	if (vis[focusedIdx]) {
		vis[focusedIdx].classList.add("focused");
		vis[focusedIdx].scrollIntoView({ behavior: "smooth", block: "nearest" });
	}
}

window.addEventListener("keydown", (e) => {
	if (document.activeElement === cmd) {
		if (e.key === "Escape") {
			cmd.blur();
			cmd.value = "";
		}
		return;
	}

	const vis = visibleCards();

	if (e.key === "j" || e.key === "ArrowDown") {
		e.preventDefault();
		focusedIdx = Math.min(vis.length - 1, focusedIdx + 1);
		updateFocus();
	}
	if (e.key === "k" || e.key === "ArrowUp") {
		e.preventDefault();
		focusedIdx = Math.max(0, focusedIdx - 1);
		updateFocus();
	}
	if (e.key === "m") {
		if (vis[focusedIdx]) vis[focusedIdx].classList.toggle("read");
	}
	if (e.key === "o" || e.key === "Enter") {
		if (vis[focusedIdx]) {
			vis[focusedIdx].style.transform = "scale(0.98)";
			setTimeout(() => (vis[focusedIdx].style.transform = ""), 150);
		}
	}
	if (e.key === "/") {
		e.preventDefault();
		cmd.focus();
	}
	if (e.key === "r") {
		cards.forEach((c) => c.classList.remove("read"));
	}
});

updateFocus();

/* ── CARD CLICK FOCUS ── */
cards.forEach((c, i) => {
	c.addEventListener("click", () => {
		const vis = visibleCards();
		focusedIdx = vis.indexOf(c);
		updateFocus();
	});
});

/* ── COMMAND PROMPT ── */
cmd.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		const v = cmd.value.toLowerCase().trim();
		if (v.startsWith("filter ") || v.startsWith("f ")) {
			const tag = v.split(" ")[1];
			const btn = Array.from(filterEls).find((el) => el.dataset.filter === tag);
			if (btn) btn.click();
		} else if (v === "mark all read") {
			cards.forEach((c) => c.classList.add("read"));
		} else if (v === "unread" || v === "reset") {
			cards.forEach((c) => c.classList.remove("read"));
		} else if (v) {
			// search by keyword
			cards.forEach((c) => {
				const t = (
					c.querySelector("h2").textContent +
					" " +
					c.querySelector("p").textContent
				).toLowerCase();
				c.classList.toggle("hidden", !t.includes(v));
			});
		}
		cmd.value = "";
	}
});

/* ── CMD+K SHORTCUT ── */
window.addEventListener("keydown", (e) => {
	if ((e.metaKey || e.ctrlKey) && e.key === "k") {
		e.preventDefault();
		cmd.focus();
	}
});
