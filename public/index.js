import {h, render} from 'preact';
import {
    ActiveLinkage as Linkage, // ActiveLinkage is experimental !!!
    useRouter,
    navigate
} from "../src";
import {memo} from "preact/compat";

const HomePageComponent = () => <h1>Home</h1>;

const AboutPageComponent = () => (
    <div>
        <h1>About</h1>
        <Linkage
            to={'/about?foo=bar'}
            // experimental prop on ActiveLinkage
            activate={'query'}
        >
            Foo Bar
        </Linkage>
        <Linkage
            to={'/about'}
            toParams={{baz: 'bing'}}
            // experimental prop on ActiveLinkage
            activate={'params'}
        >
            Baz Bing
        </Linkage>

        <button onClick={() => {
            navigate(currentState => ({
                // params: previousState.params,
                ...currentState,
                pathname: '/docs',
                hash: 'exampleOfPersistingPartOfPreviousState'
            }));
        }}>
            Programmatically navigate to Docs
        </button>
    </div>
);

const nestedPathMap = {'/docs/nested': () => <h2>Nested!!!</h2>}
const DocsPageComponent = () => {
    const {Route} = useRouter({nested: true, pathMap: nestedPathMap});
    return (
        <>
            <h1>Docs</h1>
            <Linkage to={'/docs/nested'}>
                Go to nested!
            </Linkage>
            <Route/>
        </>
    )
}


const pathMap = {
    '/': {title: 'Iosio React Router', Route: HomePageComponent},
    '/about': {title: 'about', Route: AboutPageComponent},
    '/aboutmore': {title: 'about (test)', Route: () => <h1>More about (test)</h1>},
    '/docs': {title: 'docs', Route: DocsPageComponent},
    '/docsmore': {title: 'more docs (test)', Route: () => <h1>More docs (test)</h1>},
    '/coco': {title: 'coco', Route: () => <h1>Coco</h1>},
    '/coconut': {title: 'coconut', Route: () => <h1>Coconut</h1>},
}


const NavBar = memo(() => {
    return (
        <nav>
            {Object.keys(pathMap).map((key) => {
                const {title} = pathMap[key]
                return (
                    <Linkage to={key} activate={'basePath'} key={key}>
                        {key === '/' ? <b>{title}</b> : title}
                    </Linkage>
                )
            })}
            <Linkage to={'/invalid'}>
                invalid url
            </Linkage>
        </nav>
    )
});


const App = () => {

    const {Route} = useRouter({
        pathMap,
        // when navigating to "/docs/nested"
        // the "routeOnBasePath" prop tells this (parent) router to match the first segment of the pathname "/docs"
        // then on the "/docs" page, the nested router will control the display of the "/docs/nested" route
        routeOnBasePath: true
    });

    return (
        <div>
            <NavBar/>
            <main style={{padding: 16}}>
                <Route/>
            </main>
        </div>
    );
};

render(<App/>, document.body);
