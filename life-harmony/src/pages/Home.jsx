import Hero from '../components/Hero';
import NewArrivals from '../components/NewArrivals';
import PickOfMonth from '../components/PickOfMonth';
import GreatOffer from '../components/GreatOffer';
import OurBlog from '../components/OurBlog';

export default function Home() {
    return (
        <>
            <Hero />
            <NewArrivals />
            <PickOfMonth />
            <GreatOffer />
            <OurBlog />
        </>
    );
}