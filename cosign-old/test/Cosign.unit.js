var assert = require('assert');
var should = require('should');
var sinon = require('sinon');
var Script = require('bitcore/Script').class();
var Wallet = require('bitcore/Wallet').class();
var Cosign = require('../bin/Cosign').class();

describe('Cosign', function(){

  var w1, w2, w3, w4, w5, db;

  beforeEach(function(){
  
      //testnet wallet datastores prepared for p2sh 3-of-5 multisig transaction
      w1 = { client: 'wally',client_version: '0.1',network: 'testnet',version: 1,best_hash: null,best_height: -1,keys: [ { created: 1390953746,priv: 'cNuRGmp9wMhyydnzhQiPcy6AKkL9tKXQk3wJusD8LgrxCBZEiYVi',pub: '036ff9d3a4d8fb58a0190afcc3d6ed26454c2e877e49a33285f0419b1b9460e259',addr: 'mrW7hk1CztnD4pQWvvM9HVAP6ceTgFNmp6' } ],sin: {},scripts: {},scripts: { '2N6uyiBrmFX5noZgxcCosUw22DsX9isVSwE': '5321036ff9d3a4d8fb58a0190afcc3d6ed26454c2e877e49a33285f0419b1b9460e2592103c169c45f614afadc651fde07a1e70bb7dcc3c4b24ac0ba0002a63ec45f1513a821036a87a2e8afd1dbb2431b16cf98b7fbf30bd051a747e26901a7d50bdfe6b554d3210256a1e2a9542e7f662398f46f162a4cf1b9d0e42c732913b5b19b0f854afdb7cb21037cdb8dffda7916192068b3244ea677a3b897c1df793b54d03e5f69297500626255ae' } };
      w2 = { client: 'wally',client_version: '0.1',network: 'testnet',version: 1,best_hash: null,best_height: -1,keys: [ { created: 1390953751,priv: 'cRovSjmjdUNsyfRSPw6RJMg1WTNmLAqFNP8Qai2QbUyJVwKwHf7Y',pub: '03c169c45f614afadc651fde07a1e70bb7dcc3c4b24ac0ba0002a63ec45f1513a8',addr: 'mtPJXoAhCqWfDpCUf1T8kqgK8Yq8gPgjnx' } ],sin: {},scripts: {},scripts: { '2N6uyiBrmFX5noZgxcCosUw22DsX9isVSwE': '5321036ff9d3a4d8fb58a0190afcc3d6ed26454c2e877e49a33285f0419b1b9460e2592103c169c45f614afadc651fde07a1e70bb7dcc3c4b24ac0ba0002a63ec45f1513a821036a87a2e8afd1dbb2431b16cf98b7fbf30bd051a747e26901a7d50bdfe6b554d3210256a1e2a9542e7f662398f46f162a4cf1b9d0e42c732913b5b19b0f854afdb7cb21037cdb8dffda7916192068b3244ea677a3b897c1df793b54d03e5f69297500626255ae' } };
      w3 = { client: 'wally',client_version: '0.1',network: 'testnet',version: 1,best_hash: null,best_height: -1,keys: [ { created: 1390953756,priv: 'cUFXxrb8cq6pEHqZuhmVSTY6oEGzpYznHm3CsoUX2Hj2R8BUuTQB',pub: '036a87a2e8afd1dbb2431b16cf98b7fbf30bd051a747e26901a7d50bdfe6b554d3',addr: 'mw38A6w2wQ42xjJgko7uJtkCB2Tifz9UF7' } ],sin: {},scripts: {},scripts: { '2N6uyiBrmFX5noZgxcCosUw22DsX9isVSwE': '5321036ff9d3a4d8fb58a0190afcc3d6ed26454c2e877e49a33285f0419b1b9460e2592103c169c45f614afadc651fde07a1e70bb7dcc3c4b24ac0ba0002a63ec45f1513a821036a87a2e8afd1dbb2431b16cf98b7fbf30bd051a747e26901a7d50bdfe6b554d3210256a1e2a9542e7f662398f46f162a4cf1b9d0e42c732913b5b19b0f854afdb7cb21037cdb8dffda7916192068b3244ea677a3b897c1df793b54d03e5f69297500626255ae' } };
      w4 = { client: 'wally',client_version: '0.1',network: 'testnet',version: 1,best_hash: null,best_height: -1,keys: [ { created: 1390954174,priv: 'cTEVUGeYjmXx9SPGCJuyR2pFU6Tz2yCfjXWgaEEjYyDQp8YabtPc',pub: '0256a1e2a9542e7f662398f46f162a4cf1b9d0e42c732913b5b19b0f854afdb7cb',addr: 'mtThJuuD3qNrP4v8PYYzHAyhF7gcfSKWfv' } ],sin: {},scripts: {},scripts: { '2N6uyiBrmFX5noZgxcCosUw22DsX9isVSwE': '5321036ff9d3a4d8fb58a0190afcc3d6ed26454c2e877e49a33285f0419b1b9460e2592103c169c45f614afadc651fde07a1e70bb7dcc3c4b24ac0ba0002a63ec45f1513a821036a87a2e8afd1dbb2431b16cf98b7fbf30bd051a747e26901a7d50bdfe6b554d3210256a1e2a9542e7f662398f46f162a4cf1b9d0e42c732913b5b19b0f854afdb7cb21037cdb8dffda7916192068b3244ea677a3b897c1df793b54d03e5f69297500626255ae' } };
      w5 = { client: 'wally',client_version: '0.1',network: 'testnet',version: 1,best_hash: null,best_height: -1,keys: [ { created: 1390954146,priv: 'cQQSD4eqM8uxYYYcVY8NUGoo6tGRtRLumXsLyhiibuBsyx8a6vGM',pub: '037cdb8dffda7916192068b3244ea677a3b897c1df793b54d03e5f692975006262',addr: 'mjiNNjFpybirB8HEw9pTyKsDriMdqnvkRz' } ],sin: {},scripts: {},scripts: { '2N6uyiBrmFX5noZgxcCosUw22DsX9isVSwE': '5321036ff9d3a4d8fb58a0190afcc3d6ed26454c2e877e49a33285f0419b1b9460e2592103c169c45f614afadc651fde07a1e70bb7dcc3c4b24ac0ba0002a63ec45f1513a821036a87a2e8afd1dbb2431b16cf98b7fbf30bd051a747e26901a7d50bdfe6b554d3210256a1e2a9542e7f662398f46f162a4cf1b9d0e42c732913b5b19b0f854afdb7cb21037cdb8dffda7916192068b3244ea677a3b897c1df793b54d03e5f69297500626255ae' } };

      //cosign datastore prepared for p2sh 3-of-5 multisig transaction
      //the raw transaction is unsigned
      db = { n_required: 3,pubkeys: [ '036ff9d3a4d8fb58a0190afcc3d6ed26454c2e877e49a33285f0419b1b9460e259','03c169c45f614afadc651fde07a1e70bb7dcc3c4b24ac0ba0002a63ec45f1513a8','036a87a2e8afd1dbb2431b16cf98b7fbf30bd051a747e26901a7d50bdfe6b554d3','0256a1e2a9542e7f662398f46f162a4cf1b9d0e42c732913b5b19b0f854afdb7cb','037cdb8dffda7916192068b3244ea677a3b897c1df793b54d03e5f692975006262' ],redeemScript: '5321036ff9d3a4d8fb58a0190afcc3d6ed26454c2e877e49a33285f0419b1b9460e2592103c169c45f614afadc651fde07a1e70bb7dcc3c4b24ac0ba0002a63ec45f1513a821036a87a2e8afd1dbb2431b16cf98b7fbf30bd051a747e26901a7d50bdfe6b554d3210256a1e2a9542e7f662398f46f162a4cf1b9d0e42c732913b5b19b0f854afdb7cb21037cdb8dffda7916192068b3244ea677a3b897c1df793b54d03e5f69297500626255ae',inputs: [ { txid: 'd197042b2abfb66c620f87a67960dd19f34d692b7eb55246ffd68f843ff528c8',vout: '0' } ],outputs: { mit7LdPn2qqeBpck88qzEK1Ncy4CWgxW3m: '0.0999' },inputtxs: { d197042b2abfb66c620f87a67960dd19f34d692b7eb55246ffd68f843ff528c8: '0100000002731beab3818230bacf4b36e3419786bfdcb51095281070720afe2c0460d38147000000006a4730440220644098db5b3aa56731f35bc220e77e57a97a59ca59be8c8b477311ae93211de802206a7550b62712fb49c307672474f966149b9529581f4987300c9851b8519787e20121027674525dbdff1834c10d56c159dc7d83419137659c90c271207f986ed63ac951ffffffffccbca38408fd09d3cf5abf3df59108133a48280bdd2dfc7251ed3dc5bc35d090000000006a473044022077980ec3996dba25238baf44c25ae88c0812b457031cb7eb973531f985c2eb95022043d5a40a16f6d21c44ae1e7cd0700dced6e7899c78b17ef113a59736115f3cfa0121022b1cb8d3fa9c23a95330f967e4177b8e621204cedc15794b5f9b851a9ef9d718ffffffff02809698000000000017a91495edf07e6686382f65e4c4fb83b18e20fdbedfb08700af4b00000000001976a9143550c82411d00ce2b52f1419f57ebba7a921ad7a88ac00000000' },raw: '0100000001c828f53f848fd6ff4652b57e2b694df319dd6079a6870f626cb6bf2a2b0497d10000000000ffffffff01706f9800000000001976a91424e8a9945f49d4ebcfdc13a0c463ab926d6b695a88ac00000000' };
  });

  describe('#Cosign', function(){
    it('should create a new cosign with no error', function() {
      var cosign = new Cosign(["","","dump"]);
      cosign.program.args[0].should.equal("dump");
    });
  });

  describe('cmd_raw_create', function() {
    it('should create a testnet 3-of-5 p2sh multisig transaction', function() {
      var raw = db.raw;
      db.raw = undefined;
      var fs={};
      fs.readFileSync = sinon.stub().returns(JSON.stringify(db));
      var Cosign2 = require('../bin/cosign').createClass({fs: fs});
      var cosign = new Cosign2(["","","raw.create"]);
      cosign.cmd_raw = sinon.spy();
      cosign.main();
      fs.readFileSync.calledOnce.should.equal(true);
      cosign.cmd_raw.args[0][0].should.equal(raw);
    });
  });

  describe('cmd_raw_sign', function() {
    it('should sign a testnet 3-of-5 p2sh multisig transaction', function(done) {
      var fs={};
      var Cosign2 = require('../bin/cosign').createClass({fs: fs});
      var cosign = new Cosign2(["","","raw.sign"]);
      cosign.datastore = db;
      
      //set up fake wallet to be w1
      cosign.wallet = new Wallet();
      cosign.wallet.datastore = w1;
      cosign.wallet.dirty = false;
      cosign.wallet.setNetwork(cosign.wallet.datastore.network);
      cosign.network = cosign.wallet.network;

      cosign.raw_sign_wallet_cb = function(err,tx) {
        var script = new Script(tx.ins[0].s);
        script.chunks[0].should.not.equal(0);
        script.chunks[1].should.equal(0);
        script.chunks[2].should.equal(0);
        script.chunks[3].should.equal(0);
        script.chunks[4].should.equal(0);
        script.chunks[5].should.not.equal(0);
        script.chunks.length.should.equal(6);
        done();
      };

      cosign.cmd_raw_sign();
    });
  });

  describe('#main', function() {

    describe('clean', function() {
      it('should call the clean function', function() {
        var cosign = new Cosign(["","","clean"]);
        cosign.remove_database = sinon.spy();
        cosign.main();
        cosign.remove_database.calledOnce.should.equal(true);
      });
    });

    describe('help', function() {
      it('should call the list_commands function', function() {
        var cosign = new Cosign(["","","help"]);
        cosign.list_commands = sinon.spy();
        cosign.main();
        cosign.list_commands.calledOnce.should.equal(true);
      });
    });

    describe('raw.create', function() {
      it('should call cmd_raw_create', function() {
        var fs = {};
        fs.readFileSync = function(){return "{}";};
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","raw.create"]);
        cosign.cmd_raw_create = sinon.spy();
        cosign.main();
        cosign.program.args[0].should.equal("raw.create");
        cosign.cmd_raw_create.calledOnce.should.equal(true);
      });
    });

    describe('raw.sign', function() {
      it('should call cmd_raw_sign', function() {
        var fs = {};
        fs.readFileSync = function(){return "{}";};
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","raw.sign"]);
        cosign.cmd_raw_sign = sinon.spy();
        cosign.main();
        cosign.program.args[0].should.equal("raw.sign");
        cosign.cmd_raw_sign.calledOnce.should.equal(true);
      });
    });

    describe('init', function() {
      it('should init the database file', function() {
        var fs = {};
        fs.writeFile = sinon.spy();
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","init"]);
        cosign.main();
        cosign.program.args[0].should.equal("init");
        fs.writeFile.calledOnce.should.equal(true);
      });
    });

    describe('raw.create', function() {
      it('should call cmd_raw_create', function() {
        var fs = {};
        fs.readFileSync = function(){return "{}";};
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","raw.create"]);
        cosign.cmd_raw_create = sinon.spy();
        cosign.main();
        cosign.cmd_raw_create.calledOnce.should.equal(true);
      });
    });

    describe('validate.all', function() {
      it('should call cmd_validate_all', function() {
        var fs = {};
        fs.readFileSync = function(){return "{}";};
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","validate.all"]);
        cosign.cmd_validate_all = sinon.spy();
        cosign.main();
        cosign.cmd_validate_all.calledOnce.should.equal(true);
      });
    });

    describe('validate.fees', function() {
      it('should call cmd_validate_fees', function() {
        var fs = {};
        fs.readFileSync = function(){return "{}";};
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","validate.fees"]);
        cosign.cmd_validate_fees = sinon.spy();
        cosign.main();
        cosign.cmd_validate_fees.calledOnce.should.equal(true);
      });
    });

    describe('validate.inputs', function() {
      it('should call cmd_validate_inputs', function() {
        var fs = {};
        fs.readFileSync = function(){return "{}";};
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","validate.inputs"]);
        cosign.cmd_validate_inputs = sinon.spy();
        cosign.main();
        cosign.cmd_validate_inputs.calledOnce.should.equal(true);
      });
    });

    describe('validate.inputtxs', function() {
      it('should call cmd_validate_inputtxs', function() {
        var fs = {};
        fs.readFileSync = function(){return "{}";};
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","validate.inputtxs"]);
        cosign.cmd_validate_inputtxs = sinon.spy();
        cosign.main();
        cosign.cmd_validate_inputtxs.calledOnce.should.equal(true);
      });
    });

    describe('validate.outputs', function() {
      it('should call cmd_validate_outputs', function() {
        var fs = {};
        fs.readFileSync = function(){return "{}";};
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","validate.outputs"]);
        cosign.cmd_validate_outputs = sinon.spy();
        cosign.main();
        cosign.cmd_validate_outputs.calledOnce.should.equal(true);
      });
    });

    describe('validate.p2sh', function() {
      it('should call cmd_validate_p2sh', function() {
        var fs = {};
        fs.readFileSync = function(){return "{}";};
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","validate.p2sh"]);
        cosign.cmd_validate_p2sh = sinon.spy();
        cosign.main();
        cosign.cmd_validate_p2sh.calledOnce.should.equal(true);
      });
    });

    describe('validate.pubkeys', function() {
      it('should call cmd_validate_pubkeys', function() {
        var fs = {};
        fs.readFileSync = function(){return "{}";};
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","validate.pubkeys"]);
        cosign.cmd_validate_pubkeys = sinon.spy();
        cosign.main();
        cosign.cmd_validate_pubkeys.calledOnce.should.equal(true);
      });
    });

    describe('validate.redeem', function() {
      it('should call cmd_validate_redeem', function() {
        var fs = {};
        fs.readFileSync = function(){return "{}";};
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","validate.redeem"]);
        cosign.cmd_validate_redeem = sinon.spy();
        cosign.main();
        cosign.cmd_validate_redeem.calledOnce.should.equal(true);
      });
    });

    describe('validate.sigs', function() {
      it('should call cmd_validate_sigs', function() {
        var fs = {};
        fs.readFileSync = function(){return "{}";};
        var Cosign2 = require('../bin/Cosign').createClass({fs: fs});
        var cosign = new Cosign2(["","","validate.sigs"]);
        cosign.cmd_validate_sigs = sinon.spy();
        cosign.main();
        cosign.cmd_validate_sigs.calledOnce.should.equal(true);
      });
    });
  });
});
