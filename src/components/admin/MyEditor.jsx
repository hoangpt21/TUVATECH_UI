/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/#installation/NoNgNARATAdArDADBSBGRAWOBmEBOLdOOLAdkW21P0Wu0QpAykwA5XFU9ORWUIAbgEsUiMMFRhJY6VIC6kRAGNseVACM4EOUA===
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEDITOR_LICENSE_KEY } from '../../utils/environment';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
	ClassicEditor,
	Alignment,
	AutoImage,
	AutoLink,
	Autosave,
	BalloonToolbar,
	BlockQuote,
	Bold,
	Bookmark,
	CloudServices,
	Code,
	CodeBlock,
	Essentials,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	Heading,
	Highlight,
	HorizontalLine,
	ImageBlock,
	ImageCaption,
	ImageInline,
	ImageInsertViaUrl,
	ImageResize,
	ImageStyle,
	ImageTextAlternative,
	ImageToolbar,
	ImageUpload,
	Indent,
	IndentBlock,
	Italic,
	Link,
	LinkImage,
	List,
	ListProperties,
	MediaEmbed,
	Paragraph,
	PlainTableOutput,
	RemoveFormat,
	Strikethrough,
	Subscript,
	Superscript,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableLayout,
	TableProperties,
	TableToolbar,
	TodoList,
	Underline,
  	FileRepository
} from 'ckeditor5';

import translations from 'ckeditor5/translations/vi.js';
import '../../index.css';
import 'ckeditor5/ckeditor5.css';

import { uploadFileAPI } from '../../apis';
import { message } from 'antd';

export default function MyEditor({value, onChange}) {
	const [isLayoutReady, setIsLayoutReady] = useState(false);

	useEffect(() => {
		setIsLayoutReady(true);

		return () => setIsLayoutReady(false);
	}, []);

	const { editorConfig } = useMemo(() => {
		if (!isLayoutReady) {
			return {};
		}

		return {
			editorConfig: {
				toolbar: {
					items: [
						'undo',
						'redo',
						'heading',
						'|',
						'fontSize',
						'fontFamily',
						'fontColor',
						'fontBackgroundColor',
						'|',
						'bold',
						'italic',
						'underline',
						'strikethrough',
						'subscript',
						'superscript',
						'code',
						'removeFormat',
						'|',
						'horizontalLine',
						'link',
						'bookmark',
						'mediaEmbed',
						'insertImage',
						'linkImage',
						'|',
						'insertTable',
						'insertTableLayout',
						'highlight',
						'blockQuote',
						'codeBlock',
						'|',
						'alignment',
						'|',
						'bulletedList',
						'numberedList',
						'todoList',
						'outdent',
						'indent'
					],
					shouldNotGroupWhenFull: false
				},
				plugins: [
					Alignment,
					AutoImage,
					AutoLink,
					Autosave,
					BalloonToolbar,
					BlockQuote,
					Bold,
					Bookmark,
					CloudServices,
					Code,
					CodeBlock,
					Essentials,
					FontBackgroundColor,
					FontColor,
					FontFamily,
					FontSize,
					Heading,
					Highlight,
					HorizontalLine,
					ImageBlock,
					ImageCaption,
					ImageInline,
					ImageInsertViaUrl,
					ImageResize,
					ImageStyle,
					ImageTextAlternative,
					ImageToolbar,
					ImageUpload,
					Indent,
					IndentBlock,
					Italic,
					Link,
					LinkImage,
					List,
					ListProperties,
					MediaEmbed,
					Paragraph,
					PlainTableOutput,
					RemoveFormat,
					Strikethrough,
					Subscript,
					Superscript,
					Table,
					TableCaption,
					TableCellProperties,
					TableColumnResize,
					TableLayout,
					TableProperties,
					TableToolbar,
					TodoList,
					Underline,
          			FileRepository
				],
				balloonToolbar: ['bold', 'italic', 'underline', '|', 'link', '|', 'bulletedList', 'numberedList'],
				fontFamily: {
					supportAllValues: true
				},
				fontSize: {
					options: [10, 12, 14, 'default', 18, 20, 22],
					supportAllValues: true
				},
				heading: {
					options: [
						{
							model: 'paragraph',
							title: 'Paragraph',
							class: 'ck-heading_paragraph'
						},
						{
							model: 'heading1',
							view: 'h1',
							title: 'Heading 1',
							class: 'ck-heading_heading1'
						},
						{
							model: 'heading2',
							view: 'h2',
							title: 'Heading 2',
							class: 'ck-heading_heading2'
						},
						{
							model: 'heading3',
							view: 'h3',
							title: 'Heading 3',
							class: 'ck-heading_heading3'
						},
						{
							model: 'heading4',
							view: 'h4',
							title: 'Heading 4',
							class: 'ck-heading_heading4'
						},
						{
							model: 'heading5',
							view: 'h5',
							title: 'Heading 5',
							class: 'ck-heading_heading5'
						},
						{
							model: 'heading6',
							view: 'h6',
							title: 'Heading 6',
							class: 'ck-heading_heading6'
						}
					]
				},
				image: {
					toolbar: [
						'toggleImageCaption',
						'imageTextAlternative',
						'|',
						'imageStyle:inline',
						'imageStyle:wrapText',
						'imageStyle:breakText',
						'|',
						'resizeImage'
					],
				},
        		language: 'vi',
				licenseKey: CKEDITOR_LICENSE_KEY,
				link: {
					addTargetToExternalLinks: true,
					defaultProtocol: 'https://',
					decorators: {
						toggleDownloadable: {
							mode: 'manual',
							label: 'Downloadable',
							attributes: {
								download: 'file'
							}
						}
					}
				},
				list: {
					properties: {
						styles: true,
						startIndex: true,
						reversed: true
					}
				},
				placeholder: 'Type or paste your content here!',
				table: {
					contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
				},
				translations: [translations],
        removePlugins: ['CKFinder', 'EasyImage'],
        extraPlugins: [CustomUploadAdapterPlugin],
			}
		};
	}, [isLayoutReady]);

  function CustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return {
        upload() {
          return loader.file
            .then(file => uploadFileAPI(file, 'news')) // Đổi "news" nếu cần
            .then(url => ({ default: url }))
            .catch(() => {
              message.error('Tải ảnh lên thất bại');
              throw new Error('Upload failed');
            });
        },
        abort() {}
      };
    };
  }

	return (
    <div>
		{editorConfig && 
      <CKEditor 
        editor={ClassicEditor} 
        config={editorConfig}  
        data={value}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
    />}</div>
	);
}
