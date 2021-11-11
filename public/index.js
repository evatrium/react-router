import {h, render} from 'preact';
import {Router, useLocation, Linkage} from "../src";


const HomePageComponent = () => <h1>Home</h1>;

const AboutPageComponent = () => {
    const [state, navigate] = useLocation();

    const {path, pathname, query, params, hash} = state;

    console.log('about page', state);

    return (
        <div>
            <h1>About</h1>
            <Linkage to={'/about?foo=bar'}
                     style={params.foo && {color: '#6d80f8'}}>
                Foo Bar
            </Linkage>
            <Linkage to={'/about'} toParams={{baz: 'bing'}}
                     style={params.baz && {color: '#6d80f8'}}>
                Baz Bing
            </Linkage>

            <button onClick={() => {
                navigate(previousState => ({
                    // params: previousState.params,
                    ...previousState,
                    pathname: '/docs',
                    hash: 'exampleOfPersistingPartOfPreviousState'
                }));
            }}>
                Programmatically navigate to Docs
            </button>
        </div>
    )
};

const nestedPathMap = {
    '/docs/nested': () => <h2>Nested!!!</h2>
}
const DocsPageComponent = () => {
    return (
        <>
            <h1>Docs</h1>
            <Linkage to={'/docs/nested'}>
                Go to nested!
            </Linkage>
            <Router nested pathMap={nestedPathMap}/>
        </>
    )
}

const pathMap = {
    '/': {title: 'home', Route: HomePageComponent},
    '/about': {title: 'about', Route: AboutPageComponent},
    '/docs': {title: 'docs', Route: DocsPageComponent}
}

const ContainerProps = {style: {padding: 16}};

const App = () => {

    return (
        <div>

            <nav>
                <Linkage to={'/'}><b>React Router</b></Linkage>
                <Linkage to={'/about'} toParams={{foo: 'bar'}}>About</Linkage>
                <Linkage to={'/docs'}>Docs</Linkage>
                <Linkage to={'/invalid'}>invalid url</Linkage>
            </nav>

            <Router
                pathMap={pathMap}
                // when navigating to "/docs/nested"
                // the "routeOnBasePath" prop tells this (parent) router to match the first segment of the pathname "/docs"
                // then on the "/docs" page, the nested router will display the page "/docs/nested" route
                routeOnBasePath
                ContainerComponent={'main'}
                ContainerProps={ContainerProps}/>

        </div>
    );
};

render(<App/>, document.body);
