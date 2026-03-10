import Button from '../ui/Button';

const JoinButton = ({ isMember = false, onJoin, loading = false }) => {
    return (
        <Button
            variant={isMember ? "outline" : "primary"}
            className="w-24 transition-all duration-300"
            onClick={onJoin}
            disabled={loading}
        >
            {loading ? '...' : isMember ? 'Joined' : 'Join'}
        </Button>
    );
};

export default JoinButton;
