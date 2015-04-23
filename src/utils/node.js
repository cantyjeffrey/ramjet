import styleKeys from './styleKeys';
import { svg, svgns } from './svg';

export function cloneNode ( node ) {
	const clone = node.cloneNode();

	let style;
	let len;
	let i;

	let attr;

	if ( node.nodeType === 1 ) {
		style = window.getComputedStyle( node );

		styleKeys.forEach( function ( prop ) {
			clone.style[ prop ] = style[ prop ];
		});

		len = node.attributes.length;
		for ( i = 0; i < len; i += 1 ) {
			attr = node.attributes[i];
			clone.setAttribute( attr.name, attr.value );
		}

		len = node.childNodes.length;
		for ( i = 0; i < len; i += 1 ) {
			clone.appendChild( cloneNode( node.childNodes[i] ) );
		}
	}

	return clone;
}

export function processNode ( node ) {
	const bcr = node.getBoundingClientRect();
	const style = window.getComputedStyle( node );

	const clone = node.cloneNode();
	styleKeys.forEach( function ( prop ) {
		clone.style[ prop ] = style[ prop ];
	});

	const offsetParent = node.offsetParent;
	const offsetParentStyle = window.getComputedStyle( offsetParent );
	const offsetParentBcr = offsetParent.getBoundingClientRect();

	clone.style.position = 'absolute';
	clone.style.top = ( bcr.top - parseInt( style.marginTop, 10 ) - ( offsetParentBcr.top - parseInt( offsetParentStyle.marginTop, 10 ) ) ) + 'px';
	clone.style.left = ( bcr.left - parseInt( style.marginLeft, 10 ) - ( offsetParentBcr.left - parseInt( offsetParentStyle.marginLeft, 10 ) ) ) + 'px';

	// clone children recursively. We don't do this at the top level, because we want
	// to use the reference to `style`
	const len = node.childNodes.length;
	let i;

	for ( i = 0; i < len; i += 1 ) {
		clone.appendChild( cloneNode( node.childNodes[i] ) );
	}

	const target = {
		node, bcr, clone,
		cx: ( bcr.left + bcr.right ) / 2,
		cy: ( bcr.top + bcr.bottom ) / 2,
		width: bcr.right - bcr.left,
		height: bcr.bottom - bcr.top,
		isSvg: node.namespaceURI === svgns
	};

	if ( target.isSvg ) {
		const ctm = node.getScreenCTM();
		target.transform = 'matrix(' + [ ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f ].join( ',' ) + ')';

		svg.appendChild( clone );
	} else {
		target.transform = ''; // TODO...?
		node.parentNode.appendChild( clone );
	}

	return target;
}

export function hideNode ( node ) {
	node.__ramjetOriginalTransition__ = node.style.transition;
	node.style.transition = '';

	node.style.opacity = 0;
}

export function showNode ( node ) {
	node.style.transition = '';
	node.style.opacity = 1;

	if ( node.__ramjetOriginalTransition__ ) {
		setTimeout( () => {
			node.style.transition = node.__ramjetOriginalTransition__;
		});
	}
}