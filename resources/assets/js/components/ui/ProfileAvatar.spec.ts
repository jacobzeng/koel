import { expect, it } from 'vitest'
import UnitTestCase from '@/__tests__/UnitTestCase'
import factory from '@/__tests__/factory'
import ProfileAvatar from './ProfileAvatar.vue'

new class extends UnitTestCase {
  protected test () {
    it('renders', () => {
      const user = factory('user', {
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
      })

      expect(this.be(user).render(ProfileAvatar).html()).toMatchSnapshot()
    })
  }
}
