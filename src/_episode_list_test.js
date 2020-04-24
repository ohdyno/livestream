// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("./assert.js");
const quixote = require("../vendor/quixote.js");

const WHITESPACE = 25;
const TITLE_FONT_SIZE = "18px";
const DATE_FONT_SIZE = "14px";
const EPISODE_NUMBER_FONT_SIZE = "13px";
const BUTTON_BACKGROUND = "rgb(65, 169, 204)";
const CONTENT_BACKGROUND = "rgb(255, 255, 255)";
const DROP_SHADOW = "rgba(0, 0, 0, 0.2) 0px 1px 2px 0px";

describe("Episode List CSS", function() {

	let frame;

	before(function(done) {
		frame = quixote.createFrame({
			stylesheet: "/base/src/screen.css"
		}, done);
	});

	beforeEach(function() {
		frame.reset();
	});

	function addEpisode(id, episodeList) {
		return episodeList.add(
			`<div id="${id}" class="episode episode--compact">
				<div class="episode__button">
			    <img class='episode__icon' src='/base/src/play.png' />
				</div>
				<div class="episode__content">
					<div class="episode__title">
					  <span class="episode__number">E1</span>
					  <span class="episode__name">Episode Title</span>
					</div>
					<div class="episode__date">
						Thu, 23 Apr ’20 
					</div>
				</div>
			</div>`
		);
	}

	function createEpisodeList() {
		const container = frame.add(
			`<div style='width: 750px;'></div>`
		);
		const episodeList = container.add(
			`<div class="episode_list"><div>`
		);
		addEpisode("episode1", episodeList);
		addEpisode("episode2", episodeList);
		addEpisode("episode3", episodeList);

		return {
			episodeList,
			episode: frame.get("#episode2"),
			button: frame.get("#episode2 .episode__button"),
			icon: frame.get("#episode2 .episode__icon"),
			title: frame.get("#episode2 .episode__title"),
			number: frame.get("#episode2 .episode__number"),
			name: frame.get("#episode2 .episode__name"),
			date: frame.get("#episode2 .episode__date"),
		};
	}

	it("has rounded corners", function() {
		const { episodeList } = createEpisodeList();

		assertBorderRadius(episodeList, "3px");
		assertOverflowHidden(episodeList);
	});

	it("has a drop shadow", function() {
		const { episodeList } = createEpisodeList();

		assertBoxShadow(episodeList, DROP_SHADOW);
	});

	describe("compact episode", function() {

		it("does not have rounded corners", function() {
			const { episode } = createEpisodeList();

			assertBorderRadius(episode, "0px");
			assertBoxShadow(episode, "none");
		});

		it("has a white background", function() {
			const { episode } = createEpisodeList();

			assertBackgroundColor(episode, CONTENT_BACKGROUND);
		});

		it("has button on left side", function() {
			const { episodeList, episode, button, icon } = createEpisodeList();

			button.top.should.equal(episode.top);
			button.bottom.should.equal(episode.bottom);

			button.left.should.equal(episodeList.left);
			button.width.should.equal(icon.width.plus(WHITESPACE * 2));

			assertBackgroundColor(button, BUTTON_BACKGROUND);
		});

		it("has an icon in the center of the button", function() {
			const { icon, button } = createEpisodeList();

			icon.width.should.equal(20);
			icon.center.should.equal(button.center);
			icon.middle.should.equal(button.middle);
		});

		it("has an episode number to the right of the button", function() {
			const { number, button, episode } = createEpisodeList();

			number.left.should.equal(button.right.plus(WHITESPACE));
		});

		it("centers episode number in the middle of the episode", function() {
			const { number, episode } = createEpisodeList();

			number.middle.should.equal(episode.middle);
		});

		it("puts episode name to right of episode number", function() {
			const { name, number, episode } = createEpisodeList();

			name.left.should.equal(number.right.plus(WHITESPACE / 2));
		});

		it("puts episode date at right side of episode block", function() {
			const { date, episode, name, title } = createEpisodeList();

			date.left.should.equal(title.right.plus(WHITESPACE));
			date.right.should.equal(episode.right.minus(WHITESPACE));
			date.bottom.should.equal(title.bottom);
		});

		it("has vertical padding focused on the title", function() {
			const { title, episode } = createEpisodeList();

			title.top.should.equal(episode.top.plus(WHITESPACE));
			title.bottom.should.equal(episode.bottom.minus(WHITESPACE));
		});

	});

});


function assertBorderRadius(element, radius) {
	assert.equal(element.getRawStyle("border-top-left-radius"), radius);
	assert.equal(element.getRawStyle("border-top-right-radius"), radius);
	assert.equal(element.getRawStyle("border-bottom-left-radius"), radius);
	assert.equal(element.getRawStyle("border-bottom-right-radius"), radius);
}

function assertBackgroundColor(element, backgroundColor) {
	assert.equal(element.getRawStyle("background-color"), backgroundColor);
}

function assertBoxShadow(element, shadow) {
	assert.equal(element.getRawStyle("box-shadow"), shadow);
}

function assertOverflowHidden(element) {
	assert.equal(element.getRawStyle("overflow"), "hidden");
}

/*
 * TODO:
 *
 * Factor common constants?
 *  button width
 *  WHITESPACE
 *  icon width
 * Use CSS variables and functions?
 * Refactor episode_list into a modifier of episode? Or maybe episode_list__episode
 */