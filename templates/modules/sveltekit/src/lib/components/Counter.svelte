<script lang="ts">
	let count = 0

	function increment() {
		count += 1
	}
</script>

<button on:click={increment}>
	Clicks: {count}
</button>

<style>
	button {
		font-family: inherit;
		font-size: inherit;
		padding: 1em 2em;
		color: var(--color-theme-1);
		background-color: rgba(255, 62, 0, 0.1);
		border-radius: 2em;
		border: 2px solid rgba(255, 62, 0, 0);
		outline: none;
		width: 200px;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
	}

	button:focus {
		border: 2px solid var(--color-theme-1);
	}

	button:active {
		background-color: rgba(255, 62, 0, 0.2);
	}
</style>