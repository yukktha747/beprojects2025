export default function Search({ small }) {
    return (
        <div className={`w-full ${small ? 'block' : 'lg:block hidden'}`}>
            <input type="text" className="w-full" placeholder="Search..." />
        </div>
    )
}

Search.defaultProps = {
    small: false,
}
