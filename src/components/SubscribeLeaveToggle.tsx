import { FC } from 'react'
import { Button } from './ui/Button';

interface SubscribeLeaveToggleProps {

}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({ }) => {

    const isSubscribed = false;


    return isSubscribed ? (
        <Button >
            Leave Community
        </Button>
    ) : (
        <Button>

        </Button>
    )
}

export default SubscribeLeaveToggle