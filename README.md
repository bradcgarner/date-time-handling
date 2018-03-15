Simple app to house photographic as-builts and other documentation such as files and links. 

Front end only with Firebase as the back end. 

App.js is the main component. Very few subcomponents. No Redux. Large state in App.js. App.js passes callback functions to subcomponents, bound to this of App.js to allow subcomponents to access the state of App.js. 

The Firebase app is registered with Brad’s personal Gmail address. 

On load, user sees a login screen with an option to reset password. The reset password button calls a Firebase function that sends an email from Firebase with a link that goes to a Firebase page where the user can enter a new password. This is entirely within Firebase with only minor wordsmithing to the email template in the Firebase console. 

The app does not allow the user to enter or edit any information about themselves other than their password. Due to this, Brad is manually adding users via the Firebase console. Brad enters an email address and password. The user is not notified automatically. When the user edits their password, it is not visible to the admin or anyone else. 

Firebase allows the admin to delete or temporarily disable individual user accounts. 

Firebase allows all files and data to be visible only to authenticated users. If a user manages to get a url for an image, Firebase will mot let the user see the image if they are not logged in. 

Firebase doesn't allow full control through the UI. For full control:
1) Install Firebase CLI: https://firebase.google.com/docs/cli/ Use Firebase CLI to deploy. Also be sure to edit rules in the Firebase rules.json files NOT in the GUI.
2) Install Google Cloud Storage Utilities: https://cloud.google.com/storage/docs/gsutil_install Use for moving files, renaming folders, etc. The GUI is basically limited to add and delete.
3) Good reference for gsutil: https://cloud.google.com/storage/docs/gsutil/commands/mv

When the user loads the app, before signing in, the state has only 2 pieces of app-specific information: the address of the storage bucket and app path. These would ideally not be visible to a user not logged in, but that would involve additional asynchronous work. These pieces of information are basically useless anyway, as the account is secure. 

Upon logging in, the App.js component destroys the login subcomponent, initializes main content, and renders the main content and some subcomponents of that.

Initialization queries the database for all captions and loads captions into state. Each caption has 2 parts in the database: id and value (text). The text includes 3 parts: the associated file path, a splitter, and text. When creating a caption, the script reads the first 2 parts from state and concatenates with the user entry for storage. Upon retrieval, these are split into 3 total parts in state: id, path, text. When an image is loaded, the entire array of captions is searched (O(n)) to find a matching caption. (Should be hydrated to object for O(1) at some point.). The caption is then saved in state in App.js. See more in 2 paragraphs. 

Firebase’s API does not create a list of all files in storage. However, Google Cloud Storage allows such list creation in their interface. Until that works real-time, when images are uploaded, we have to manually get the list from GCS and save in a list.js file. The list-generator.js file then runs at initialization to recursively parse that list into an object tree of folders and files.  Though the recursive algorithm will go as deeply as needed, other parts of the program are hard-coded for 2 levels, so only 2 levels in file storage. E.g. “north/boxes/filename.png”. 

At app initialization, the file and folder tree is saved in state as this.state.tree[parent][folder].files: [array-of-strings]. Parent and folder are naming conventions throughout. Each time we want a file, we call Firebase with the reference (parent+folder+filename) to get the file. Files are NOT preloaded, only the tree that is a map of the files. 

Still at initialization, the main menu is created, with one button for each parent, reading from top-level folders, with exceptions hard-coded (currently 'cable-runs' is an exception).

Still at initialization, after the tree is created, one ClickableArea component is automatically created for each folder. The ClickableArea component is basically just a button with a map to the array of files. By default, the ClickableArea components are absolutely positioned off the screen. Each ClickableArea needs to be manually positioned on the screen. Do this as percentages of the parent image from top left. On very small screens, each ClickableArea is min 30x30, which has potential to overlap, but tested fine on iPhone. Also position by parent then folder, e.g “.north .boxes” so that each ClickableArea is positioned responsive to the current main image. 

When clicking the main menu, the main image toggles. This toggles the class of <main> to the parent name. This allows non-associated ClickableAreas to remain off the screen, and allows re-use of clickable areas on more than one main image. 

When the ClickableArea is clicked, it passes the folder information to App.js’s state, which causes the ImageModal to render and passes props to the ImageModal. ImageModal uses the props to query Firebase and get the actual image. 

The caption is tricky. The caption exists in 5 places: database, App.js state to be passed as a prop, ImageModal state as part of a controlled component, the rendered variable in ImageModal “captionText”, and the text input in ImageModal. Here is how those are synced. 

Click on ClickableArea triggers loading image and searching preloaded array of captions in App.js state. When found, caption is passed to App.js state (outside array) where is becomes a prop to pass to ImageModal. ImageModal receives the prop right away. On first render, the prop is saved to state via the constructor. On re-rendering, the prop is saved to state on demand (not via life-cycle methods) when the user clicks just about anything (edit, advance, etc). 

Since props passed to ImageModal are closer to the database, they take priority. So ImageModal looks for props by default before looking to its own state. 

So that editing the caption is responsive and prepopulates, it is a controlled component. So it saves in ImageModal’s state via onChange and is submitted from state, not from value in the input. 

Upon submission to Firebase, the caption array in App.js state is updated with the new text, since the full array is only updated on initialization. 

Because App.js isn’t passing props to InageModal immediately (are we updating the single caption?) ImageModal component has an “edited” property in state that is used immediately after a caption is edited. If the caption has been edited, it is true until the image is changed. This is a temporary over-ride for responsiveness. !!!!!!!!!!

Initialization has a special rule for folders named “composite”. Instead of one ClickableArea with an array, they get one clickable area per file. These are used for changing the background image without changing the parent. E.g. multiple “north” background images. These are useful for looking “behind” things, as in the background image is the same except for moving 1 thing. These have a different icon on hover. 

Next up links and other file types. 

Resize photos using bulkresizephotos.com or similar.  Currently set to fairly high res of 1600px along long edge, which is small enough to keep storage down, but large enough to see a lot of detail if needed.  Images are allowed to exceed the screen height, which means a little scrolling for tall photos, but with the added feature of being able to see more detail without zooming.