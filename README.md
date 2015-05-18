Notes:
* Max dimensions: 2048x2048
* Strip EXIM tags
+ Format descriptions as Markdown
* Display copyright notice
* FBT logo
* Thumbnail each featured photo

Gallery model
-------------

* featured gallery - pointer into galleries
* galleries:
    [
        * name
        * primary image
        * slug
        * description
        * photos:
            [
                * filename
                * caption
            ]
    ]
