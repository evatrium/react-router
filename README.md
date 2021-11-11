# @iosio/react-router

> Simple react-router. Mostly familiar api with a few opinionated twists.


### Installation

```
npm install @iosio/react-router
```

### Usage

See the example in the demo (/public/index.js).

### Router

This router accepts a pathMap or an object where the keys represent the "/path" and the value is an object with two
keys: title and Route:

```js
const pathMap = {
    '/': {title: 'home', Route: HomePageComponent,},
    '/about': {title: 'about', Route: AboutPageComponent},
    '/docs': {title: 'docs', Route: DocsPageComponent}
}

const ContainerProps = {style: {padding: 16}};

const App = () => {

    return (
        <>
            <nav/>
            <Router pathMap={pathMap} ContainerProps={ContainerProps}/>
        </>
    )
}

```

##### props

- **pathMap** - Object - example: { '/path': { title: 'page title', Route: Component } }

(optional)

- **fallbackPath** - String - default: "/" - the default path to fallback to if no match is found
- **ContainerComponent** - string|Component - default: "div"


**Built-in Logic:**

If the user attempts to visit a page that is not on the pathMap, the router will attempt to replace history with the
previously visited path, else it will navigate to "/" or whatever is defined as the fallbackPath.

### Linkage

##### props

- **to** - String
- **toParams** - Object - pass an object to be stringified into query parameters

```js
// both go to /about?foo=bar
<Linkage to={'/about?foo=bar'}>About</Linkage>
<Linkage to={'/about'} toParams={{foo: 'bar'}}>About</Linkage>
```

### navigate

```js
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

const AboutPageComponent = () => {
    
    const [{path, pathname, query, params, hash}, navigate] = useLocation();
    
    return <h1>About</h1>
};
```

### License

[MIT](https://choosealicense.com/licenses/mit/)


