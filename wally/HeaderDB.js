require('classtool');

function ClassSpec(b) {
	var assert = require('assert');
	var fs = require('fs');
	var Block = require('bitcore/Block');
	var Deserialize = require('bitcore/Deserialize');
	var Parser = require('bitcore/util/BinaryParser');

	function HeaderDB(b) {
		this.network = b.network;
		this.fd = null;
		this.blocks = {};
		this.byHeight = [];
		this.bestBlock = null;
	};

	HeaderDB.prototype.size = function() {
		return Object.keys(this.blocks).length;
	};

	HeaderDB.prototype.locator = function(block) {
		if (!block)
			block = this.bestBlock;

		var index = block.height;
		var step = 1;
		var loc = [];

		while (index >= 0) {
			loc.push(this.byHeight[index]);
			if (index == 0)
				break;

			var height = Math.max(index - step, 0);
			while (index > height)
				index--;

			if (loc.length > 10)
				step *= 2;
		}

		assert.equal(this.byHeight[0].toString(),
			    this.network.genesisBlock.hash.toString());

		return loc;
	};

	HeaderDB.prototype.add = function(block) {
		var hash = block.calcHash();
		block.hash = hash;
		var curWork = Deserialize.intFromCompact(block.bits);

		if (hash in this.blocks)
			throw new Error("duplicate block");

		var bestChain = false;

		var reorg = {
			oldBest: null,
			conn: 0,
			disconn: 0,
		};

		if (this.size() == 0) {
			if (this.network.genesisBlock.hash.toString() !=
			    hash.toString())
				throw new Error("Invalid genesis block");

			block.height = 0;
			block.work = curWork;
			bestChain = true;
		} else {
			var prevBlock = this.blocks[block.prev_hash];
			if (!prevBlock)
				throw new Error("orphan block; prev not found");

			block.height = prevBlock.height + 1;
			block.work = prevBlock.work + curWork;

			if (block.work > this.bestBlock.work)
				bestChain = true;
		}

		// add to by-hash index
		this.blocks[hash] = block;

		if (bestChain) {
			var oldBest = this.bestBlock;
			var newBest = block;

			reorg.oldBest = oldBest;

			// likely case: new best chain has greater height
			if (!oldBest) {
				while (newBest) {
					newBest = this.blocks[newBest.prev_hash];
					reorg.conn++;
				}
			} else {
				while (newBest &&
				       (newBest.height > oldBest.height)) {
					newBest = this.blocks[newBest.prev_hash];
					reorg.conn++;
				}
			}

			// unlikely: old best chain has greater height
			while (oldBest && newBest &&
			       (oldBest.height > newBest.height)) {
				oldBest = this.blocks[oldBest.prev_hash];
				reorg.disconn++;
			}

			// height matches, but still walking parallel
			while (oldBest && newBest && (oldBest != newBest)) {
				newBest = this.blocks[newBest.prev_hash];
				reorg.conn++;

				oldBest = this.blocks[oldBest.prev_hash];
				reorg.disconn++;
			}

			var shuf = (reorg.conn > reorg.disconn) ?
				   reorg.conn : reorg.disconn;

			// reorg analyzed, updated best-chain pointer
			this.bestBlock = block;

			// update by-height index
			var ptr = block;
			var updated = [];
			for (var idx = block.height; 
			     idx > (block.height - shuf); idx--) {
				if (idx < 0)
					break;
				var update = [ idx, ptr ];
				updated.push(update);
				ptr = this.blocks[ptr.prev_hash];
			}

			updated.reverse();

			for (var i = 0; i < updated.length; i++) {
				var update = updated[i];
				var idx = update[0];
				var ptr = update[1];

				if (idx < this.byHeight.length)
					this.byHeight[idx] = ptr.hash;
				else
					this.byHeight.push(ptr.hash);
			}
		}

		return reorg;
	};

	HeaderDB.prototype.addBuf = function(buf) {
		var block = new Block();
		var parser = new Parser(buf);
		block.parse(parser, true);
		this.add(block);
	};

	HeaderDB.prototype.readFile = function(filename) {
		var fd = fs.openSync(filename, 'r');
		var stats = fs.fstatSync(fd);
		if (stats.size % 80 != 0)
			throw new Error("Corrupted header db");

		while (1) {
			var buf = new Buffer(80);
			var bread = fs.readSync(fd, buf, 0, 80, null);
			if (bread < 80)
				break;

			this.addBuf(buf);
		}

		fs.closeSync(fd);
	};

	HeaderDB.prototype.writeFile = function(filename) {
		var block = this.bestBlock;
		var data = [];
		while (block) {
			var s = block.getHeader();
			data.push(s);
			block = this.blocks[block.prev_hash];
		}

		data.reverse();

		var fd = fs.openSync(filename, 'w');

		data.forEach(function(datum) {
			fs.writeSync(fd, datum, 0, 80, null);
		});

		fs.closeSync(fd);
	};

	return HeaderDB;
};
module.defineClass(ClassSpec);

