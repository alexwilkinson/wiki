"use strict";

var express = require('express');
var router = express.Router();
var _ = require('lodash');

// ==========================================
// EDIT MODE
// ==========================================

/**
 * Edit document in Markdown
 */
router.get('/edit/*', (req, res, next) => {

	let safePath = entries.parsePath(_.replace(req.path, '/edit', ''));

	entries.fetchOriginal(safePath, {
		parseMarkdown: false,
		parseMeta: true,
		parseTree: false,
		includeMarkdown: true,
		includeParentInfo: false,
		cache: false
	}).then((pageData) => {
		if(pageData) {
			return res.render('pages/edit', { pageData });
		} else {
			throw new Error('Invalid page path.');
		}
	}).catch((err) => {
		res.render('error', {
			message: err.message,
			error: {}
		});
	});

});

router.put('/edit/*', (req, res, next) => {

	let safePath = entries.parsePath(_.replace(req.path, '/edit', ''));

	entries.update(safePath, req.body.markdown).then(() => {
		res.json({
			ok: true
		});
	}).catch((err) => {
		res.json({
			ok: false,
			error: err.message
		});
	});

});

// ==========================================
// CREATE MODE
// ==========================================

router.get('/create/*', (req, res, next) => {

	if(_.some(['create','edit','account','source','history','mk'], (e) => { return _.startsWith(req.path, '/create/' + e); })) {
		return res.render('error', {
			message: 'You cannot create a document with this name as it is reserved by the system.',
			error: {}
		});
	}
	
	let safePath = entries.parsePath(_.replace(req.path, '/create', ''));

	entries.exists(safePath).then((docExists) => {
		if(!docExists) {
			return entries.getStarter(safePath).then((contents) => {

				let pageData = {
					markdown: contents,
					meta: {
						title: _.startCase(safePath),
						path: safePath
					}
				};
				res.render('pages/create', { pageData });

				return true;

			}).catch((err) => {
				throw new Error('Could not load starter content!');
			});
		} else {
			throw new Error('This entry already exists!');
		}
	}).catch((err) => {
		res.render('error', {
			message: err.message,
			error: {}
		});
	});

});

router.put('/create/*', (req, res, next) => {

	let safePath = entries.parsePath(_.replace(req.path, '/create', ''));

	entries.create(safePath, req.body.markdown).then(() => {
		res.json({
			ok: true
		});
	}).catch((err) => {
		res.json({
			ok: false,
			error: err.message
		});
	});

});

// ==========================================
// VIEW MODE
// ==========================================

/**
 * View source of a document
 */
router.get('/source/*', (req, res, next) => {

	let safePath = entries.parsePath(_.replace(req.path, '/source', ''));

	entries.fetchOriginal(safePath, {
		parseMarkdown: false,
		parseMeta: true,
		parseTree: false,
		includeMarkdown: true,
		includeParentInfo: false,
		cache: false
	}).then((pageData) => {
		if(pageData) {
			return res.render('pages/source', { pageData });
		} else {
			throw new Error('Invalid page path.');
		}
	}).catch((err) => {
		res.render('error', {
			message: err.message,
			error: {}
		});
	});

});

/**
 * View document
 */
router.get('/*', (req, res, next) => {

	let safePath = entries.parsePath(req.path);

	entries.fetch(safePath).then((pageData) => {
		if(pageData) {
			return res.render('pages/view', { pageData });
		} else {
			res.render('error', {
				message: err.message,
				error: {}
			});
		}
	}).catch((err) => {
		res.render('error', {
			message: err.message,
			error: {}
		});
	});

});

module.exports = router;