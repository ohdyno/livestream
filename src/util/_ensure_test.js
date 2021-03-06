// Copyright Titanium I.T. LLC. See LICENSE.txt for details.
"use strict";

const assert = require("./assert.js");
const ensure = require("./ensure.js");
const EnsureException = ensure.EnsureException;

describe("Ensure", function() {

	describe("condition checking", function() {

		it("checks if condition is true", function() {
			const that = wrap(ensure.that);

			assert.doesNotThrow(that(true));
			assert.throws(that(false), /Expected condition to be true/);
			assert.throws(that(false, "a message"), /a message/);
			assert.throws(that("foo"), /Expected condition to be true or false/);
			assert.throws(that("foo", "ignored"), /Expected condition to be true or false/);
		});

		it("fails when unreachable code is executed", function() {
			const unreachable = wrap(ensure.unreachable);

			assert.throws(unreachable(), /Unreachable code executed/);
			assert.throws(unreachable("foo"), /foo/);
		});

		it("fails when to-do is executed", function() {
			const todo = wrap(ensure.todo);

			assert.throws(todo(), /To-do code executed/);
		});

	});

	describe("signature checking", function() {

		const signature = wrap(ensure.signature);
		const signatureMinimum = wrap(ensure.signatureMinimum);

		it("checks no arguments", function() {
			assert.doesNotThrow(signature([]));
			assert.throws(signature([ "foo" ]), /Function called with too many arguments: expected 0 but got 1/);
		});

		it("checks one argument", function() {
			assert.doesNotThrow(signature([ "foo" ], [ String ]), "valid");
			assert.throws(
				signature([ "foo", "bar" ], [ String ]),
				/Function called with too many arguments: expected 1 but got 2/,
				"# of arguments"
			);
			assert.throws(signature([ 42 ], [ String ]), /Argument #1 must be a string, but it was a number/, "invalid");
		});

		it("checks multiple arguments", function() {
			assert.doesNotThrow(signature([ "foo", "bar", "baz" ], [ String, String, String ]), "valid");
			assert.throws(
				signature([ "foo", "bar", "baz" ], [ String, String]),
				/Function called with too many arguments: expected 2 but got 3/,
				"# of arguments"
			);
			assert.throws(
				signature( [ "foo", 42, 36 ], [ String, String, String ]),
				/Argument #2 must be a string, but it was a number/,
				"fails on first wrong parameter"
			);
		});

		it("supports custom names", function() {
			assert.throws(
				signature([ 1, 2, 3 ], [ Number, String, Number ], [ "a", "b", "c" ]),
				/b must be a string, but it was a number/,
				"all names specified"
			);
			assert.throws(
				signature([ 1, 2, 3 ], [ Number, String, Number ], [ "a" ]),
				/Argument #2 must be a string, but it was a number/,
				"falls back to generic names if some names not specified"
			);
		});

		it("signatureMinimum allows extra keys in object signatures", function() {
			assert.doesNotThrow(
				signatureMinimum([ { requiredParm: true, extraParm: true } ], [ { requiredParm: Boolean } ])
			);
		});

		it("signatureMinimum allows extra parameters", function() {
			assert.doesNotThrow(signatureMinimum([ 1, 2 ], [ Number ]));
		});

		it("supports built-in types", function() {
			assert.doesNotThrow(signature([ false ], [ Boolean ]));
			assert.throws(signature([ false ], [ String ]));

			assert.doesNotThrow(signature([ "1" ], [ String ]));
			assert.throws(signature([ "1" ], [ Number ]));

			assert.doesNotThrow(signature([ 1 ], [ Number ]));
			assert.throws(signature([ 1 ], [ Function ]));

			assert.doesNotThrow(signature([ function() {} ], [ Function ]));
			assert.throws(signature([ function() {} ], [ Object ]));

			assert.doesNotThrow(signature([ {} ], [ Object ]));
			assert.throws(signature([ {} ], [ Array ]));

			assert.doesNotThrow(signature([ [] ], [ Array ]));
			assert.throws(signature([ [] ], [ RegExp ]));

			assert.doesNotThrow(signature([ /foo/ ], [ RegExp ]));
			assert.throws(signature([ /foo/ ], [ Boolean ]));
		});

		it("supports weird types (primarily for allowing nullable objects, etc.)", function() {
			assert.doesNotThrow(signature([ undefined ], [ undefined ]));
			assert.throws(signature([ undefined ], [ null ]), /Argument #1 must be null, but it was undefined/);

			assert.doesNotThrow(signature([ null ], [ null ]));
			assert.throws(signature([ null ], [ NaN ]), /Argument #1 must be NaN, but it was null/);

			assert.doesNotThrow(signature([ NaN ], [ NaN ]));
			assert.throws(signature([ NaN ], [ undefined ]), /Argument #1 must be undefined, but it was NaN/);
		});

		it("supports custom types", function() {
			function MyClass() {}
			const NoName = function() {};
			delete NoName.name;

			assert.doesNotThrow(signature([ new MyClass() ], [ MyClass ]), "valid MyClass");
			assert.doesNotThrow(signature([ new NoName() ], [ NoName ]), "valid anon class");
			assert.throws(
				signature([ {} ], [ MyClass ]),
				/Argument #1 must be a MyClass instance, but it was an object/,
				"invalid MyClass"
			);
			assert.throws(
				signature([ {} ], [ NoName ]),
				/Argument #1 must be an <anon> instance, but it was an object/,
				"invalid anon class"
			);
			assert.throws(
				signature([ new NoName() ], [ MyClass ]),
				/Argument #1 must be a MyClass instance, but it was an <anon> instance/,
				"invalid anon instance"
			);
		});

		it("supports multiple types", function() {
			assert.doesNotThrow(signature([ 1 ], [[ String, Number ]]), "valid");
			assert.throws(
				signature([ 1 ], [ [ String, Boolean, function MyClass() {} ] ]),
				/Argument #1 must be a string, a boolean, or a MyClass instance, but it was a number/,
				"invalid"
			);
		});

		it("allows optional arguments", function() {
			assert.doesNotThrow(signature([ 1 ], [ Number, [ undefined, String ] ]), "optional parameter");
			assert.throws(
				signature([], [ Number ]),
				/Argument #1 must be a number, but it was undefined/,
				"required parameter"
			);

			assert.doesNotThrow(signature([ {} ], [ [undefined, Object] ]), "filled-in optional object");

			assert.throws(
				signature([ "foo" ], [ [undefined, Object] ]),
				/Argument #1 must be undefined or an object, but it was a string/,
				"optional parameter filled in with wrong type"
			);
		});

	});

	describe("type checking", function() {

		it("checks if variable is defined", function() {
			const defined = wrap(ensure.defined);

			assert.doesNotThrow(defined("foo"));
			assert.doesNotThrow(defined(null));
			assert.throws(defined(undefined), /variable was not defined/);
			assert.throws(defined(undefined, "myVariable"), /myVariable was not defined/);
		});

		it("checks if variable is a particular type", function() {
			const type = wrap(ensure.type);
			assert.throws(type("string", Number, "const name"), /const name must be a number, but it was a string/);
		});

		it("type checking supports extra keys in object signatures", function() {
			assert.doesNotThrow(
				() => ensure.typeMinimum({ requiredParm: true, extraParm: true }, { requiredParm: Boolean })
			);
		});

	});

	function wrap(fn) {
		return function() {
			const outerArgs = arguments;
			return function() {
				fn.apply(this, outerArgs);
			};
		};
	}

});
