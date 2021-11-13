# @iosio/react-router

> Simple react-router.


### Installation

```
npm install @iosio/react-router
```

### Usage

See the example in the demo (/public/index.js).

### useRouter

This router accepts an object where the keys represent the "/path" and the value is a component or an object with two
keys: title and Route (component). The document title will be set when the route changes.

```js
import {useRouter} from '@iosio/react-router';
const pathMap = {
    '/': {title: 'home', Route: HomePageComponent,},
    '/about': {title: 'about', Route: AboutPageComponent},
    '/docs': {title: 'docs', Route: DocsPageComponent}
}

const App = () => {
    const {Route} = useRouter({pathMap});
    return (
        <>
            <nav/>
            <main>
                <Route/>
            </main>
        </>
    )
}

```

- **pathMap** - Object - example: { '/path': { title: 'page title', Route: Component } }

(optional)

- **fallbackPath** - String - default: "/" - the default path to fallback to if no match is found


**Built-in Logic:**

If the user attempts to visit a page that is not on the pathMap, the router will attempt to replace history with the
previously visited path, else it will navigate to "/" or the path that is defined as the fallbackPath.


### Linkage

##### props

- **to** - String
- **toParams** - Object - pass an object to be stringified into query parameters
- **...rest** - rest spread to the root anchor tag element <a {...rest}/>
```js
import {Linkage} from '@iosio/react-router';
// both go to /about?foo=bar
<Linkage to={'/about?foo=bar'}>About</Linkage>
<Linkage to={'/about'} toParams={{foo: 'bar'}}>About</Linkage>
```

### navigate

Programmatically navigate 

```js
import {navigate} from '@iosio/react-router';
// string
navigate('/path?id=1#foo');
// object
navigate({
    pathname: '/path',

    query: '?id=1',
    // or optionally use params (Object that will be stringified)
    params: {id: 1},

    hash: '#foo'
});
// function
navigate(({pathname, query, params, hash}) => ({
    pathname,
    params: {...params, id: 2}
}));
```

### useLocation

```js
import {useLocation} from '@iosio/react-router';
const AboutPageComponent = () => {
    
    const [{path, pathname, query, params, hash}, navigate] = useLocation();
    
    return <h1>About</h1>
};
```

### License

[MIT](https://choosealicense.com/licenses/mit/)


